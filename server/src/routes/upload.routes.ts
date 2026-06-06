import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { authenticate } from '../middleware/auth';
import { r2Client, isR2Enabled, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../lib/r2';

const router = express.Router();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer memory storage (we process with Sharp before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Multer error handling middleware
const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 2MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  // If it's not a multer error, pass to the next error handler
  next(err);
};

interface UploadResult {
  key: string;
  publicUrl: string;
  thumbnailUrl: string;
  size: number;
}

async function processAndUploadImage(file: Express.Multer.File): Promise<UploadResult> {
  const id = crypto.randomBytes(12).toString('hex');
  const ext = 'webp';

  // Process full image (max 1920px width, WebP, quality 85)
  const fullBuffer = await sharp(file.buffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  // Process thumbnail (max 400px width, WebP, quality 80)
  const thumbBuffer = await sharp(file.buffer)
    .resize({ width: 400, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const fullKey = `images/${id}/full.${ext}`;
  const thumbKey = `images/${id}/thumb.${ext}`;

  if (isR2Enabled && r2Client) {
    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fullKey,
        Body: fullBuffer,
        ContentType: 'image/webp',
      })
    );

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: thumbKey,
        Body: thumbBuffer,
        ContentType: 'image/webp',
      })
    );

    return {
      key: fullKey,
      publicUrl: `${R2_PUBLIC_URL}/${fullKey}`,
      thumbnailUrl: `${R2_PUBLIC_URL}/${thumbKey}`,
      size: fullBuffer.length,
    };
  } else {
    // Local storage mode
    const subDir = id.slice(0, 2);
    const dirPath = path.join(UPLOADS_DIR, subDir, id);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const fullPath = path.join(dirPath, `full.${ext}`);
    const thumbPath = path.join(dirPath, `thumb.${ext}`);

    fs.writeFileSync(fullPath, fullBuffer);
    fs.writeFileSync(thumbPath, thumbBuffer);

    return {
      key: `${subDir}/${id}/full.${ext}`,
      publicUrl: `/api/v1/upload/serve/${subDir}/${id}/full.${ext}`,
      thumbnailUrl: `/api/v1/upload/serve/${subDir}/${id}/thumb.${ext}`,
      size: fullBuffer.length,
    };
  }
}

// Multi-file upload endpoint
router.post('/files', authenticate, upload.array('files', 20), multerErrorHandler, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const results: UploadResult[] = [];

    for (const file of files) {
      const result = await processAndUploadImage(file);
      results.push(result);
    }

    res.json({ results });
  } catch (error) {
    next(error);
  }
});

// Single file upload (backward compatible)
router.post('/file', authenticate, upload.single('file'), multerErrorHandler, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await processAndUploadImage(req.file);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Serve uploaded files (local mode only)
router.get('/serve/:subDir/:id/:filename', (req, res) => {
  const { subDir, id, filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, subDir, id, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(path.resolve(filePath));
});

export default router;
