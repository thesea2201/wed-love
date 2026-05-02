# WedLove - Developer Reference

> Quick-reference guide for the development team.  
> For full technical details, see [TECHNICAL_PLAN.md](TECHNICAL_PLAN.md) and linked plan docs.

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────┐
│  CLIENT (React 19 + Vite + Tailwind v4)     │  :5173 (dev)
│  State: Zustand + React Query               │
│  Animation: Framer Motion + GSAP            │
└──────────────────┬───────────────────────────┘
                   │ Axios (JWT in localStorage)
┌──────────────────▼───────────────────────────┐
│  SERVER (Node.js + Express + TypeScript)     │  :3000
│  ORM: Prisma v7 + @prisma/adapter-pg        │
│  Auth: JWT (bcrypt hash)                    │
│  Rate Limit: express-rate-limit             │
└──────────────────┬───────────────────────────┘
         ┌─────────┴─────────┐
┌────────▼────────┐  ┌───────▼────────┐
│  PostgreSQL 16  │  │    Redis 7     │
│  (Docker :5432) │  │ (Docker :6379) │
└─────────────────┘  └────────────────┘
```

---

## 2. Quick Start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Server
cd server
npm install
npx prisma migrate dev
npx prisma generate
npx tsx prisma/seed.ts    # Demo data
npx tsx src/index.ts       # http://localhost:3000

# 3. Client (separate terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

### Demo Credentials
- **Email:** `demo@wedlove.pro` / **Password:** `123456`
- **Invitation slug:** `an-va-linh-demo`

---

## 3. Project Structure

```
wed-love/
├── client/                     # React 19 SPA
│   ├── src/
│   │   ├── components/         # UI components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── StorySection.tsx
│   │   │   ├── EventSection.tsx
│   │   │   ├── RSVPSection.tsx
│   │   │   ├── GuestList.tsx
│   │   │   ├── InvitationEditor.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── hooks/              # React Query hooks
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx    # Login/Register
│   │   │   ├── InvitationView.tsx  # Public invitation
│   │   │   └── AdminDashboard.tsx  # Editor + Guests + Analytics
│   │   ├── utils/
│   │   │   ├── api.ts          # Axios instance + JWT interceptor
│   │   │   └── upload.ts       # File upload helper
│   │   ├── App.tsx             # Routes: /, /dashboard, /invitation/:slug
│   │   ├── main.tsx            # Entry: QueryClient + BrowserRouter
│   │   └── index.css           # Tailwind v4 imports
│   ├── postcss.config.js       # @tailwindcss/postcss (NOT tailwindcss)
│   ├── vite.config.ts          # Proxy /api → localhost:3000
│   └── package.json
│
├── server/                     # Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts     # PrismaPg adapter pattern
│   │   ├── generated/prisma/   # Prisma generated client
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authenticate middleware
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── invitation.routes.ts
│   │   │   ├── guest.routes.ts
│   │   │   └── upload.routes.ts
│   │   └── index.ts            # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma       # 10 models
│   │   ├── seed.ts             # Demo data seeder
│   │   └── migrations/
│   ├── uploads/                # Local file storage
│   └── package.json
│
├── docs/
│   ├── CLIENT_PRD.md           # Client-facing PRD
│   ├── DEV_REFERENCE.md        # This file
│   ├── TECHNICAL_PLAN.md      # Master plan index
│   └── plan/                   # Detailed plan docs (01-06)
│
├── docker-compose.yml          # PostgreSQL 16 + Redis 7
└── PROGRESS.md                 # Milestone tracker
```

---

## 4. Database Schema (10 Models)

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **User** | Cặp đôi | email, groomName, brideName, plan |
| **Invitation** | Thiệp cưới | slug, template, sections (JSON), gallery (String[]) |
| **Guest** | Khách mời | token (unique), rsvpStatus, customMessage, qrCodeUrl |
| **Analytics** | Thống kê | event, guestToken, metadata (JSON) |
| **GuestPhoto** | Ảnh khách upload | photoUrl, moderationStatus, aiTags |
| **VoiceMessage** | Lời chúc voice/video | type, fileUrl, transcript |
| **Livestream** | Livestream | provider, streamKey, playbackId, status |
| **ChatMessage** | Chat livestream | message, type |
| **Payment** | Thanh toán | type, amount, currency, provider, status |
| **AISuggestion** | AI gợi ý | type, input (JSON), suggestions (JSON) |

### Key Relations
- User → Invitations (1:N, cascade)
- Invitation → Guests (1:N, cascade)
- Invitation → Analytics, GuestPhotos, VoiceMessages, Livestreams, AISuggestions, Payments
- Guest → VoiceMessages, ChatMessages, GuestPhotos, Payments

---

## 5. API Endpoints

### Auth (`/api/v1/auth`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Register + JWT |
| POST | `/login` | No | Login + JWT |
| GET | `/me` | Yes | Current user |

### Invitations (`/api/v1/invitations`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List user's invitations |
| POST | `/` | Yes | Create invitation |
| GET | `/:slug` | No | Public view (`?token=guest-uuid`) |
| PATCH | `/:id` | Yes | Update invitation |
| POST | `/:id/publish` | Yes | Publish |
| POST | `/:id/duplicate` | Yes | Duplicate |
| GET | `/:id/analytics` | Yes | Dashboard stats |

### Guests (`/api/v1/guests`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List with filters & pagination |
| POST | `/` | Yes | Add single guest |
| POST | `/bulk` | Yes | Bulk import |
| POST | `/:token/rsvp` | No | Public RSVP |
| GET | `/export` | Yes | Export guests |

### Upload (`/api/v1/upload`)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/presigned-url` | Yes | Get upload URL |
| POST | `/file` | Yes | Direct upload (local) |
| GET | `/serve/:subDir/:file` | No | Serve uploaded files |

---

## 6. Critical Patterns

### Prisma v7 Adapter (MUST follow)
```typescript
// ✅ CORRECT — server/src/config/database.ts
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({
  host: 'localhost', port: 5432,
  database: 'wedlove', user: 'wedlove', password: 'wedlove123'
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// ❌ WRONG — causes SASL authentication error
const adapter = new PrismaPg({ connectionString: 'postgresql://...' });
```

### Tailwind CSS v4 PostCSS
```javascript
// ✅ CORRECT — client/postcss.config.js
export default { plugins: { '@tailwindcss/postcss': {} } }

// ❌ WRONG — v4 no longer uses this
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

### JWT Auth Flow
```
Client login → POST /auth/login → { token, user }
→ Store token in localStorage
→ Axios interceptor adds Authorization: Bearer <token>
→ 401 response → auto-logout (remove token, redirect /)
```

### Vite Dev Proxy
```typescript
// client/vite.config.ts — proxies /api to Express server
server: {
  proxy: { '/api': 'http://localhost:3000' }
}
```

---

## 7. Environment Variables

### Server (`server/.env`)
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Express port |
| `DATABASE_URL` | — | Prisma connection string (used by CLI only) |
| `JWT_SECRET` | — | Token signing key |
| `FRONTEND_URL` | `*` | CORS origin |
| `AWS_S3_BUCKET` | — | S3 bucket (optional, local fallback if empty) |
| `AWS_REGION` | — | S3 region |
| `AWS_CLOUDFRONT_DOMAIN` | — | CDN domain |

### Docker
| Service | Port | Credentials |
|---------|------|-------------|
| PostgreSQL | 5432 | user: `wedlove`, pass: `wedlove123`, db: `wedlove` |
| Redis | 6379 | No auth (local dev) |

---

## 8. Common Commands

```bash
# Database
cd server
npx prisma migrate dev          # Run migration
npx prisma generate             # Regenerate client
npx prisma studio               # GUI browser
npx tsx prisma/seed.ts         # Seed demo data

# Build
cd client && npm run build     # Production build → dist/

# Type check
cd client && npx tsc --noEmit  # Check TS errors
```

---

## 9. Known Issues & Workarounds

1. **Prisma v7 SASL bug** — Use `PrismaPg(pool)` not `PrismaPg({ connectionString })`
2. **Tailwind v4 plugin** — Must use `@tailwindcss/postcss` in PostCSS config
3. **TS lint warnings** — Some `any` types in routes; Prisma generated client not always recognized by IDE
4. **Upload local-only** — Files in `server/uploads/`, need S3 for production
5. **InvitationEditor fetch** — Uses `/invitations/:id` (auth required), public slug route returns different shape

---

## 10. Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (auth, CRUD, basic UI) | ✅ Done |
| 2 | Personalization (Excel import, QR, templates, music, gallery) | 🔄 Next |
| 3 | AI (content gen, photo analysis, smart personalization) | 📋 Planned |
| 4 | Social (livestream, voice, gifts, payments) | 📋 Planned |

See [PROGRESS.md](../PROGRESS.md) for detailed milestone tracker.
