import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import invitationRoutes from './routes/invitation.routes';
import guestRoutes from './routes/guest.routes';
import uploadRoutes from './routes/upload.routes';
import wishRoutes from './routes/wish.routes';
import wishAdminRoutes from './routes/wish-admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to PostgreSQL
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/guests', guestRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1', wishRoutes);
app.use('/api/v1', wishAdminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
