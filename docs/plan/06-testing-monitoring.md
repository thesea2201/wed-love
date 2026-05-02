# Testing, Monitoring & Appendix

> Part of [TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md)

## 10. Testing Strategy

### 10.1 Testing Pyramid

```
        /\
       /  \
      / E2E\          (Playwright - 10%)
     /────────\       Critical user journeys
    /          \
   / Integration\    (Jest + Supertest - 30%)
  /──────────────\   API endpoints, services
 /                \
/    Unit Tests    \ (Jest - 60%)
──────────────────── Functions, utilities, validation
```

### 10.2 Key Test Cases

```typescript
// server/__tests__/rsvp.test.ts
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';

describe('RSVP Flow', () => {
  it('should allow guest to RSVP with personalized token', async () => {
    const guest = await prisma.guest.findFirst({ where: { rsvpStatus: 'pending' } });

    const response = await request(app)
      .post(`/api/v1/guests/${guest!.token}/rsvp`)
      .send({
        status: 'attending',
        attendees: 2,
        dietary: ['vegetarian'],
      });

    expect(response.status).toBe(200);
    expect(response.body.guest.rsvpStatus).toBe('attending');
  });

  it('should reject RSVP with invalid token', async () => {
    const response = await request(app)
      .post('/api/v1/guests/invalid-token/rsvp')
      .send({ status: 'attending' });

    expect(response.status).toBe(404);
  });
});

// server/__tests__/auth.test.ts
describe('Auth', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `test-${Date.now()}@example.com`,
        password: '123456',
        groomName: 'Test',
        brideName: 'User',
        weddingDate: '2026-12-25',
      });

    expect(response.status).toBe(201);
    expect(response.body.token).toBeDefined();
  });

  it('should reject duplicate email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'demo@wedlove.pro', password: '123456', groomName: 'A', brideName: 'B', weddingDate: '2026-12-25' });

    expect(response.status).toBe(400);
  });
});
```

---

## 11. Monitoring & Observability

### 11.1 Logging (Winston — TypeScript)

```typescript
// server/src/utils/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: { service: 'wedlove-api' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Request logging middleware
export const requestLogger = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip,
    });
  });
  next();
};
```

### 11.2 Metrics (Prometheus)

```typescript
// server/src/utils/metrics.ts
import promClient from 'prom-client';

export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const rsvpCounter = new promClient.Counter({
  name: 'rsvp_total',
  help: 'Total RSVPs',
  labelNames: ['status'],
});

export const giftTotal = new promClient.Counter({
  name: 'gift_amount_total',
  help: 'Total gift amount received',
  labelNames: ['currency'],
});
```

---

## Appendix: Comparison Matrix

| Feature | Đối thủ | WedLove (Phase 1) | WedLove (Pro) |
|---------|----------|-------------------|----------------|
| **Stack** | Unknown | React 19 + PostgreSQL + Prisma | Same + AI microservice |
| **Animations** | Parallax, fade-in | Framer Motion parallax ✅ | Drag-drop editor |
| **Personalization** | Name only | Name + custom message ✅ | Full Excel + photos |
| **QR Codes** | Basic link | ❌ TODO | Batch generation |
| **Digital Gift** | ❌ | ❌ TODO | Multi-gateway + hidden amount |
| **Voice/Video** | ❌ | ❌ TODO | Full implementation |
| **Livestream** | ❌ | ❌ TODO | Mux integration |
| **AI Layout** | ❌ | ❌ TODO | GPT-4o analysis |
| **AI Writing** | ❌ | ❌ TODO | 4 styles |
| **Auto Thank You** | ❌ | ❌ TODO | AI-generated |
| **Guest Photos** | ❌ | ❌ TODO | Upload + AI tagging |
| **Analytics** | Basic | Real-time views ✅ | Advanced insights |

---

## Next Steps

1. **Wire frontend to real API** (Task 1.11) — Replace mock data in `InvitationView` and `AdminDashboard`
2. **Add S3 upload** (Task 1.12) — Implement `@aws-sdk/s3-request-presigner` in `upload.routes.ts`
3. **Start Phase 2** — Excel import UI + QR codes + more templates
4. **Setup CI/CD** — GitHub Actions for lint + test + deploy
