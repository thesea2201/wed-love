# Development Roadmap & Infrastructure

> Part of [TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md)

## 8. Development Roadmap

### Phase 1: Foundation (Tuần 1-4) — ✅ MOSTLY DONE

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Project setup (Vite, Express, folder structure) | ✅ | |
| 1.2 | Docker: PostgreSQL 16 + Redis 7 | ✅ | OrbStack |
| 1.3 | Prisma schema + migration | ✅ | 4 models: User, Invitation, Guest, Analytics |
| 1.4 | Auth: register/login + JWT | ✅ | bcrypt + JWT, tested |
| 1.5 | Invitation CRUD API | ✅ | create, list, get by slug, update, publish, duplicate, analytics |
| 1.6 | Guest management + RSVP API | ✅ | add, list, bulk import, RSVP, export |
| 1.7 | Seed data | ✅ | demo@wedlove.pro / 123456 |
| 1.8 | Client: Auth page | ✅ | Login/Register form |
| 1.9 | Client: Invitation view (cinematic) | ✅ | Hero, Story, Event, RSVP sections + parallax |
| 1.10 | Client: Admin dashboard | ✅ | Editor, Guest list, Analytics tabs |
| 1.11 | **Connect frontend to real API** | ❌ | Currently using mock data |
| 1.12 | **Media upload (S3)** | ❌ | Only local upload + mock endpoint |

**Milestone:** MVP hoạt động được, hoàn thiện MVP

### Phase 2: Personalization & Polish (Tuần 5-7)

| # | Task | Depends On | Notes |
|---|------|-----------|-------|
| 2.1 | Excel/CSV guest import UI | 1.11 | Backend bulk import exists, need SheetJS UI |
| 2.2 | QR code per guest | 2.1 | `qrcode` npm + short URL redirect |
| 2.3 | More templates (5 total) | 1.11 | elegant, modern, minimal, vintage |
| 2.4 | Music player on invitation | 1.12 | Background music with autoplay/fade |
| 2.5 | Gallery section + lightbox | 1.12 | Photo grid with Framer Motion lightbox |
| 2.6 | Countdown timer | 1.11 | Connect to real weddingDate |

**Milestone:** Nâng cấp tính năng cá nhân hóa

### Phase 3: AI Features (Tuần 8-11)

| # | Task | Depends On | Notes |
|---|------|-----------|-------|
| 3.1 | AI content generation (GPT-4o) | 1.12 | Node.js service calling OpenAI API |
| 3.2 | AI photo storytelling | 3.1 | GPT-4V analysis + template suggestions |
| 3.3 | Smart guest personalization | 3.1 | AI-generated custom messages per guest |
| 3.4 | AI writing assistant (4 styles) | 3.1 | romantic/humorous/formal/poetic |

**Milestone:** AI differentiation vs competitors

### Phase 4: Advanced Features (Tuần 12-15)

| # | Task | Depends On | Notes |
|---|------|-----------|-------|
| 4.1 | Voice/video messages | 1.12 | MediaRecorder + Whisper transcription |
| 4.2 | Livestream integration | 4.1 | Mux/Cloudflare + Socket.io chat |
| 4.3 | Digital gift envelopes | 2.2 | Stripe + MoMo + ZaloPay + bank QR |
| 4.4 | Payment integration | 4.3 | Subscription plans (free/premium/pro) |
| 4.5 | Guest photo upload portal | 1.12 | Dropzone + client-side optimization |
| 4.6 | Automated thank you messages | 3.1 | Bull queue + AI-generated + email |

**Milestone:** Nền tảng WedLove hoàn chỉnh

### Phase 5: Polish & Scale (Tuần 16-20)

| # | Task | Notes |
|---|------|-------|
| 5.1 | Drag-and-drop editor | Advanced template customization |
| 5.2 | Performance optimization | Redis caching, lazy loading, CDN |
| 5.3 | Security audit | OWASP, STRIDE threat modeling |
| 5.4 | Load testing | k6 or Artillery |
| 5.5 | Mobile app (React Native) | Optional |

**Milestone:** Production-ready, scalable platform

---

## 9. Infrastructure & Deployment

### 9.1 Docker Compose (Local Dev — ✅ IMPLEMENTED)

```yaml
# docker-compose.yml — ACTUAL FILE
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: wedlove
      POSTGRES_USER: wedlove
      POSTGRES_PASSWORD: wedlove123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 9.2 Production Deployment (Recommended)

```yaml
# Production docker-compose or Kubernetes
services:
  app:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/wedlove
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  client:
    build: ./client
    ports:
      - "80:80"  # Nginx serving built React app

  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### 9.3 Environment Variables

```bash
# server/.env.example
# Core
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL via Prisma)
# NOTE: Prisma v7 uses pg.Pool directly, not DATABASE_URL for adapter
# But keep DATABASE_URL for prisma migrate CLI
DATABASE_URL=postgresql://wedlove:wedlove123@localhost:5432/wedlove

# Redis
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=  # 32-byte hex string for AES-256-GCM (Phase 4)

# AWS S3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=wedlove-uploads
AWS_REGION=ap-southeast-1
AWS_CLOUDFRONT_DOMAIN=cdn.wed-love.com

# AI Services (Phase 3)
OPENAI_API_KEY=

# Payment (Phase 4)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MOMO_PARTNER_CODE=
MOMO_ACCESS_KEY=
ZALOPAY_APP_ID=

# Livestream (Phase 4)
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=noreply@wed-love.com
```
