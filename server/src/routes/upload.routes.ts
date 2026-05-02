import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../middleware/auth';

const router = express.Router();

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Generate presigned URL for client-side upload (S3 mode when configured)
router.post('/presigned-url', authenticate, async (req, res, next) => {
  try {
    const { fileName, contentType } = req.body;

    if (process.env.AWS_S3_BUCKET) {
      // S3 mode: return presigned URL for direct-to-S3 upload
      // TODO: implement with @aws-sdk/s3-request-presigner when S3 is configured
      res.json({
        uploadUrl: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/`,
        key: `uploads/${crypto.randomBytes(8).toString('hex')}/${fileName}`,
        publicUrl: `https://cdn.example.com/placeholder`,
      });
    } else {
      // Local mode: return server upload endpoint
      const key = `uploads/${crypto.randomBytes(8).toString('hex')}/${fileName}`;
      res.json({
        uploadUrl: `/api/v1/upload/file`,
        key,
        publicUrl: `/api/v1/upload/serve/${key}`,
      });
    }
  } catch (error) {
    next(error);
  }
});

// Direct file upload (local storage mode)
router.post('/file', authenticate, async (req: any, res, next) => {
  try {
    const chunks: Buffer[] = [];
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const contentLength = parseInt(req.headers['content-length'] || '0');

    // Max 10MB
    if (contentLength > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large (max 10MB)' });
    }

    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const ext = contentType.includes('image/') ? contentType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg' : 'bin';
      const filename = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
      const subDir = filename.slice(0, 2);
      const dirPath = path.join(UPLOADS_DIR, subDir);

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const filePath = path.join(dirPath, filename);
      fs.writeFileSync(filePath, buffer);

      const key = `${subDir}/${filename}`;
      res.json({
        key,
        publicUrl: `/api/v1/upload/serve/${key}`,
        size: buffer.length,
      });
    });
  } catch (error) {
    next(error);
  }
});

// Serve uploaded files
router.get('/serve/:subDir/:filename', (req, res) => {
  const { subDir, filename } = req.params;
  const filePath = path.join(UPLOADS_DIR, subDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

export default router;
