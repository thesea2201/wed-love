import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema } from '../schemas';

const router = express.Router();

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  } as jwt.SignOptions);
};

// Register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, groomName, brideName, weddingDate } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        groomName,
        brideName,
        weddingDate: new Date(weddingDate),
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        groomName: user.groomName,
        brideName: user.brideName,
        weddingDate: user.weddingDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        groomName: user.groomName,
        brideName: user.brideName,
        weddingDate: user.weddingDate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      groomName: user.groomName,
      brideName: user.brideName,
      weddingDate: user.weddingDate,
    },
  });
});

export default router;
