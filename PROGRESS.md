# WedLove - Progress Tracker

> Last updated: 2026-05-01 14:55 UTC+7

## 🏗️ Architecture

| Component | Stack | Status |
|-----------|-------|--------|
| Database | PostgreSQL 16 (Docker) + Prisma v7 ORM | ✅ Running |
| Cache | Redis 7 (Docker) | ✅ Running |
| Server | Node.js + Express + TypeScript | ✅ Running on :3000 |
| Client | React 19 + Vite + Tailwind CSS v4 + Framer Motion | ✅ Running on :5173 |

## 📊 Milestone Overview

### Phase 1: Foundation ✅ COMPLETE
| # | Task | Status | Notes |
|---|------|--------|-------|
| 1.1 | Project setup (Vite, Express, folder structure) | ✅ DONE | |
| 1.2 | Docker: PostgreSQL + Redis | ✅ DONE | `docker-compose.yml`, OrbStack |
| 1.3 | Prisma schema + migration | ✅ DONE | 4 models: User, Invitation, Guest, Analytics |
| 1.4 | Auth: register/login + JWT | ✅ DONE | bcrypt + JWT, tested |
| 1.5 | Invitation CRUD API | ✅ DONE | create, list, get by slug, update, publish, duplicate, analytics |
| 1.6 | Guest management + RSVP API | ✅ DONE | add, list, bulk import, RSVP, export |
| 1.7 | Seed data | ✅ DONE | demo@wedlove.pro / 123456, 1 invitation, 5 guests |
| 1.8 | Client: Auth page | ✅ DONE | Login/Register form |
| 1.9 | Client: Invitation view (cinematic) | ✅ DONE | Hero, Story, Event, RSVP sections + parallax |
| 1.10 | Client: Admin dashboard | ✅ DONE | Editor, Guest list, Analytics tabs |
| 1.11 | **Connect frontend to real API** | ✅ DONE | api.ts axios instance, all components wired to real backend |
| 1.12 | **Media upload (S3)** | ✅ DONE | Local file upload + ImageUpload component, S3-ready |
| 1.13 | **Multi-tab InvitationEditor** | ✅ DONE | Content/Design/Sections tabs + real-time preview + AI story assistant |
| 1.14 | **Design Documentation** | ✅ DONE | DESIGN.md + TESTING.md for section-based theme system |

### Phase 2: Personalization & Polish
| # | Task | Status | Notes |
|---|------|--------|-------|
| 2.1 | Excel/CSV guest import | ❌ TODO | Backend bulk import exists, need UI |
| 2.2 | QR code per guest | ❌ TODO | Generate unique QR linking to invitation+token |
| 2.3 | More templates (5 total) | ❌ TODO | Only "cinematic" now, need elegant/modern/minimal/vintage |
| 2.4 | Music player on invitation | ❌ TODO | Background music with autoplay/fade |
| 2.5 | Gallery section | ❌ TODO | Photo grid with lightbox |
| 2.6 | Countdown timer | ❌ TODO | Component exists but not connected to real data |

### Phase 3: AI Features
| # | Task | Status | Notes |
|---|------|--------|-------|
| 3.1 | AI content generation (GPT-4V) | ❌ TODO | Auto-generate story, vows, messages |
| 3.2 | AI photo enhancement | ❌ TODO | Style transfer for photos |
| 3.3 | Smart guest personalization | ❌ TODO | AI-generated custom messages per guest |

### Phase 4: Advanced Features
| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Voice/video messages | ❌ TODO | Whisper AI transcript |
| 4.2 | Livestream integration | ❌ TODO | WebRTC or Mux |
| 4.3 | Digital gift envelopes | ❌ TODO | Stripe/Momo/ZaloPay |
| 4.4 | Payment integration | ❌ TODO | Subscription plans |

---

## 📁 Key Files Reference

### Server
| File | Purpose |
|------|---------|
| `server/src/index.ts` | Express entry point, middleware, routes |
| `server/src/config/database.ts` | Prisma + PostgreSQL connection (PrismaPg adapter) |
| `server/src/middleware/auth.ts` | JWT auth middleware |
| `server/src/routes/auth.routes.ts` | Register, login, /me |
| `server/src/routes/invitation.routes.ts` | CRUD, publish, duplicate, analytics |
| `server/src/routes/guest.routes.ts` | Add, list, bulk, RSVP, export |
| `server/src/routes/upload.routes.ts` | Presigned URL (mock) |
| `server/prisma/schema.prisma` | DB schema: User, Invitation, Guest, Analytics |
| `server/prisma/seed.ts` | Demo data seeder |
| `server/.env` | DATABASE_URL, JWT_SECRET, etc. |

### Client
| File | Purpose |
|------|---------|
| `client/src/main.tsx` | React entry, QueryClient, BrowserRouter |
| `client/src/App.tsx` | Routes: /, /dashboard, /invitation/:slug |
| `client/src/pages/AuthPage.tsx` | Login/Register form |
| `client/src/pages/InvitationView.tsx` | Cinematic invitation with parallax |
| `client/src/pages/AdminDashboard.tsx` | Editor, Guests, Analytics tabs |
| `client/src/components/HeroSection.tsx` | Names, countdown, personalized greeting |
| `client/src/components/StorySection.tsx` | Our story layout |
| `client/src/components/EventSection.tsx` | Ceremony & reception info |
| `client/src/components/RSVPSection.tsx` | RSVP form (attending/maybe/declined) |
| `client/src/components/GuestList.tsx` | Guest management with add modal |
| `client/src/components/InvitationEditor.tsx` | Multi-tab editor: Content/Design/Sections + Preview |
| `client/src/components/invitation-editor/ContentTab.tsx` | Edit names, date, venue, story, times |
| `client/src/components/invitation-editor/DesignTab.tsx` | Template, colors, font, cover photo |
| `client/src/components/invitation-editor/SectionsTab.tsx` | Toggle/reorder sections, per-section config |
| `client/src/components/invitation-editor/PreviewPane.tsx` | Real-time iframe preview with draft data |
| `docs/DESIGN.md` | Section system design specification |
| `docs/TESTING.md` | QA test cases for all 9 sections |
| `client/src/utils/api.ts` | Axios instance with JWT token + 401 redirect |
| `client/src/utils/upload.ts` | File upload helper (local + S3 modes) |
| `client/src/components/ImageUpload.tsx` | Drag-to-upload image component |

### Infrastructure
| File | Purpose |
|------|---------|
| `docker-compose.yml` | PostgreSQL 16 + Redis 7 |
| `server/prisma/migrations/` | DB migration history |

---

## 🔑 Demo Credentials
- **Email:** demo@wedlove.pro
- **Password:** 123456
- **Invitation slug:** an-va-linh-demo

## 🚀 How to Run
```bash
# 1. Start Docker (first time only)
docker compose up -d

# 2. Start server
cd server && npx tsx src/index.ts

# 3. Start client (separate terminal)
cd client && npm run dev

# 4. Reseed DB (if needed)
cd server && npx tsx prisma/seed.ts
```

## ⚠️ Known Issues
1. **Prisma v7 adapter pattern** — Must use `PrismaPg(pool)` not `PrismaPg({connectionString})` due to SASL auth bug
2. **Tailwind v4** — Requires `@tailwindcss/postcss` plugin (not plain `tailwindcss`)
3. **TypeScript lint warnings** — Some `any` types in routes, generated Prisma client not recognized by IDE
4. **Upload is local-only** — Files stored in `server/uploads/`, need AWS S3 for production
5. **InvitationEditor fetch by ID** — Uses `/invitations/:id` (auth required), public slug route returns different shape

## 📚 Documentation

| Document | Audience | Path |
|----------|----------|------|
| Client PRD | Business stakeholders | `docs/CLIENT_PRD.md` |
| Developer Reference | Development team | `docs/DEV_REFERENCE.md` |
| Technical Plan (master) | All | `docs/TECHNICAL_PLAN.md` |
| Architecture & Schema | Dev | `docs/plan/01-architecture-and-schema.md` |
| API Design | Dev | `docs/plan/02-api-design.md` |
| Feature Details | Dev | `docs/plan/03-features.md` |
| Real-time & Security | Dev | `docs/plan/04-realtime-security-performance.md` |
| Roadmap & Infra | All | `docs/plan/05-roadmap-and-infra.md` |
| Testing & Monitoring | Dev | `docs/plan/06-testing-monitoring.md` |

## 🎯 Next Priority (Phase 2)
1. **Excel/CSV guest import UI** — Backend bulk import exists, need file upload + column mapping UI
2. **QR code per guest** — Generate unique QR linking to invitation+token
3. **More templates** — Only "cinematic" now, add elegant/modern/minimal/vintage
4. **Music player** — Background music with autoplay/fade on invitation page
5. **Gallery section** — Photo grid with lightbox on invitation page
