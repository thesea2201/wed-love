# Real-Time, Security & Performance

> Part of [TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md)

## 5. Real-Time Features

### 5.1 Socket.io Architecture (TypeScript)

```typescript
// server/src/socket/index.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export const setupSocketIO = (server: any) => {
  const io = new Server(server, {
    cors: { origin: process.env.FRONTEND_URL || '*' },
    transports: ['websocket', 'polling'],
  });

  // Redis adapter for multi-server scaling
  const pubClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Namespaces
  const livestreamNs = io.of('/livestream');
  const dashboardNs = io.of('/dashboard');

  // Authentication middleware (for dashboard — couples only)
  dashboardNs.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string };
      (socket as any).userId = decoded.userId;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  // Dashboard: join invitation room
  dashboardNs.on('connection', (socket) => {
    const userId = (socket as any).userId;
    socket.on('subscribe:invitation', (invitationId: string) => {
      socket.join(`invitation:${invitationId}`);
    });
  });

  // Real-time dashboard stats (every 5s)
  setInterval(async () => {
    const invitations = await prisma.invitation.findMany({
      where: { isPublished: true },
      select: { id: true },
    });
    for (const inv of invitations) {
      const [views, rsvps] = await Promise.all([
        prisma.analytics.count({ where: { invitationId: inv.id, event: 'view' } }),
        prisma.guest.groupBy({
          by: ['rsvpStatus'],
          where: { invitationId: inv.id },
          _count: { rsvpStatus: true },
        }),
      ]);
      dashboardNs.to(`invitation:${inv.id}`).emit('stats:update', { views, rsvps });
    }
  }, 5000);

  // Livestream chat handled in Section 4.B.3
  return io;
};
```

---

## 6. Security Implementation

### 6.1 Authentication & Authorization (✅ Partially Implemented)

```typescript
// server/src/middleware/auth.ts — ALREADY IMPLEMENTED
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';

export const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret') as { userId: string };
    (req as any).userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Guest token verification (for public invitation pages) — used in invitation.routes.ts
// Already implemented inline in GET /invitations/:slug
```

**Rate limiting — already in `server/src/index.ts`:**
```typescript
// Current: 100 requests per 15 min on /api/
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// TODO: Add stricter limits for uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req: any) => req.userId || req.ip,
});
// app.use('/api/v1/upload', uploadLimiter);
```

### 6.2 Data Protection

```typescript
// Sanitize guest output — hide sensitive fields from non-owners
const sanitizeGuestOutput = (guest: any, isOwner: boolean) => {
  const base = {
    name: guest.name,
    rsvpStatus: guest.rsvpStatus,
    customMessage: guest.customMessage,
    sharedPhoto: guest.sharedPhoto,
  };

  // Only return email/phone/gift info to invitation owner
  if (isOwner) {
    return { ...base, email: guest.email, phone: guest.phone, giftAmount: guest.giftAmount };
  }
  return base;
};

// File upload security — in upload.routes.ts
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (current)
// TODO: Increase to 20MB for video uploads in Phase 4

// Encryption for sensitive data (Phase 4 — payment processing)
import crypto from 'crypto';

const encrypt = (text: string): string => {
  const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};
```

---

## 7. Performance Optimization

### 7.1 Frontend

```typescript
// Lazy load sections (already partially used in InvitationView)
const HeroSection = lazy(() => import('./components/HeroSection'));
const GallerySection = lazy(() => import('./components/GallerySection'));
const RSVPSection = lazy(() => import('./components/RSVPSection'));

// Intersection Observer for animation triggers
const useInView = (options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.disconnect(); // Trigger once
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
};

// Image optimization with responsive srcSet
const ResponsiveImage = ({ src, alt, sizes }: { src: string; alt: string; sizes: string }) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    srcSet={`
      ${src.replace('.jpg', '-400.jpg')} 400w,
      ${src.replace('.jpg', '-800.jpg')} 800w,
      ${src.replace('.jpg', '-1200.jpg')} 1200w
    `}
    sizes={sizes}
  />
);
```

### 7.2 Backend Caching (Redis)

```typescript
// server/src/middleware/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const cacheMiddleware = (ttl = 300) => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const key = `cache:${req.originalUrl}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    redis.setex(key, ttl, JSON.stringify(body));
    return originalJson(body);
  };

  next();
};

// Cache invalidation
export const invalidateCache = async (pattern: string) => {
  const keys = await redis.keys(`cache:*${pattern}*`);
  if (keys.length) await redis.del(...keys);
};

// Usage: cache public invitation pages (60s TTL)
// app.get('/api/v1/invitations/:slug', cacheMiddleware(60), handler);
```

### 7.3 Prisma Query Optimization

```typescript
// Use select to limit returned fields
const invitation = await prisma.invitation.findUnique({
  where: { slug },
  select: {
    id: true, title: true, groomName: true, brideName: true,
    weddingDate: true, venue: true, story: true,
    // Don't select gallery array for list views
  },
});

// Use include only when needed
const invitationWithGuests = await prisma.invitation.findUnique({
  where: { slug },
  include: {
    guests: {
      select: { id: true, name: true, rsvpStatus: true },
      where: { rsvpStatus: 'attending' },
    },
  },
});

// Batch writes with createMany (already used in /guests/bulk)
await prisma.guest.createMany({ data: guestsToInsert });
```
