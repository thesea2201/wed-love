# Architecture & Database Schema

> Part of [TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md)

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  React 19   │  │ Framer Motion│  │  React Query / Zustand │  │
│  │  (Vite)     │  │  (Animations)│  │  (State Management)    │  │
│  │  Tailwind v4│  │              │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                              │
│              Nginx / AWS API Gateway / Cloudflare               │
│         (Rate Limiting, SSL Termination, Caching)               │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (Node.js)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────┐ │
│  │  Core API   │  │  AI Service │  │  Real-time  │  │Payment │ │
│  │  (Express)  │  │  (Node.js)  │  │  (Socket.io)│  │(Stripe)│ │
│  │  Prisma v7  │  │  OpenAI API │  │  Redis Adptr│  │+ VN GW │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ PostgreSQL16 │  │    Redis    │  │  AWS S3     │            │
│  │  (Primary)  │  │   (Cache)   │  │  (Storage)  │            │
│  │  Prisma v7  │  │  Bull Queue │  │  CloudFront │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack Chi Tiết

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | React 19 + Vite | Fast HMR, tree-shaking, optimal bundle size |
| **Styling** | Tailwind CSS v4 + `@tailwindcss/postcss` | Utility-first, v4 requires postcss plugin (NOT `tailwindcss: {}`) |
| **Animation** | Framer Motion + GSAP | Parallax, scroll-triggered animations cao cấp |
| **State** | Zustand + React Query | Lightweight, excellent caching |
| **Backend** | Node.js + Express + TypeScript | Mature ecosystem, async I/O for real-time features |
| **ORM** | Prisma v7 + `@prisma/adapter-pg` | Type-safe queries, migrations, PostgreSQL adapter |
| **Database** | PostgreSQL 16 | Relational integrity, JSON support, full-text search |
| **Cache** | Redis 7 | Session store, rate limiting, Bull queue backend, pub/sub |
| **Storage** | AWS S3 + CloudFront | CDN cho images/videos, signed URLs cho bảo mật |
| **AI** | Node.js microservice + OpenAI API | Same language as codebase, simpler deployment than Python |
| **Real-time** | Socket.io + Redis Adapter | Live chat, livestream signaling, presence |
| **Queue** | Bull + Redis | Background jobs (email, AI processing, transcription) |
| **Payment** | Stripe + MoMo + ZaloPay | International + VN local methods |

### ⚠️ Critical Implementation Notes

**Prisma v7 Adapter Pattern** — Must use explicit `pg.Pool`, NOT connection string:
```typescript
// ✅ CORRECT
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ host:'localhost', port:5432, database:'wedlove', user:'wedlove', password:'wedlove123' });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });

// ❌ WRONG — causes SASL authentication error
const adapter = new PrismaPg({ connectionString: 'postgresql://...' });
```

**Tailwind CSS v4** — PostCSS config must use new plugin:
```javascript
// ✅ CORRECT (postcss.config.js)
export default { plugins: { '@tailwindcss/postcss': {} } }

// ❌ WRONG — v4 no longer uses this
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
```

---

## 2. Database Schema Design (Prisma v7)

### 2.1 Existing Models (Phase 1 ✅)

```prisma
// --- ALREADY IMPLEMENTED in server/prisma/schema.prisma ---

generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id           String       @id @default(uuid())
  email        String       @unique
  password     String
  groomName    String
  brideName    String
  weddingDate  DateTime
  phone        String?
  avatar       String?
  plan         String       @default("free")    // 'free' | 'premium' | 'pro'
  invitations  Invitation[]
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@map("users")
}

model Invitation {
  id            String     @id @default(uuid())
  userId        String     @map("user_id")
  slug          String     @unique
  template      String     @default("cinematic") // 'cinematic' | 'elegant' | 'modern' | 'minimal' | 'vintage'
  title         String
  subtitle      String?
  primaryColor  String     @default("#d4a574")
  fontFamily    String     @default("Playfair Display")
  groomName     String
  brideName     String
  weddingDate   DateTime
  venue         String?
  venueAddress  String?    @map("venue_address")
  ceremonyTime  String?    @map("ceremony_time")
  receptionTime String?    @map("reception_time")
  story         String?
  coverPhoto    String?    @map("cover_photo")
  gallery       String[]   @default([])
  isPublished   Boolean    @default(false) @map("is_published")
  publishedAt   DateTime?  @map("published_at")
  guests        Guest[]
  analytics     Analytics[]
  user          User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@index([userId])
  @@map("invitations")
}

model Guest {
  id             String     @id @default(uuid())
  invitationId   String     @map("invitation_id")
  name           String
  email          String?
  phone          String?
  token          String     @unique
  rsvpStatus     String     @default("pending") @map("rsvp_status") // 'pending' | 'attending' | 'declined' | 'maybe'
  rsvpAttendees  Int        @default(0) @map("rsvp_attendees")
  rsvpDietary    String[]   @default([]) @map("rsvp_dietary")
  rsvpResponded  DateTime?  @map("rsvp_responded")
  customMessage  String?    @map("custom_message")
  sharedPhoto    String?    @map("shared_photo")
  tableNumber    String?    @map("table_number")
  giftAmount     Int        @default(0) @map("gift_amount")
  giftMessage    String?    @map("gift_message")
  giftMethod     String?    @map("gift_method")
  giftPaidAt     DateTime?  @map("gift_paid_at")
  invitation     Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@index([invitationId, rsvpStatus])
  @@map("guests")
}

model Analytics {
  id            String     @id @default(uuid())
  invitationId  String     @map("invitation_id")
  event         String     // 'view' | 'rsvp' | 'gift' | 'photo_upload' | 'voice_message'
  guestToken    String?    @map("guest_token")
  userAgent     String?    @map("user_agent")
  ip            String?
  metadata      Json?
  invitation    Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  createdAt     DateTime   @default(now())

  @@index([invitationId, event])
  @@map("analytics")
}
```

### 2.2 New Models (Phase 2-4)

```prisma
// --- TO BE ADDED via prisma migrate dev ---

model VoiceMessage {
  id               String   @id @default(uuid())
  guestId          String   @map("guest_id")
  invitationId     String   @map("invitation_id")
  type             String   // 'audio' | 'video'
  fileUrl          String   @map("file_url")
  duration         Int      // seconds
  transcript       String?  // Whisper AI generated
  isPublic         Boolean  @default(false) @map("is_public")
  moderationStatus String   @default("pending") @map("moderation_status") // 'pending' | 'approved' | 'rejected'
  guest            Guest    @relation(fields: [guestId], references: [id], onDelete: Cascade)
  invitation       Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  createdAt        DateTime @default(now())

  @@index([invitationId, moderationStatus])
  @@map("voice_messages")
}

model Livestream {
  id             String     @id @default(uuid())
  invitationId   String     @map("invitation_id")
  provider       String     @default("mux") // 'mux' | 'cloudflare' | 'agora'
  streamKey      String?    @map("stream_key")
  playbackId     String?    @map("playback_id")
  status         String     @default("scheduled") // 'scheduled' | 'live' | 'ended'
  scheduledAt    DateTime?  @map("scheduled_at")
  startedAt      DateTime?  @map("started_at")
  endedAt        DateTime?  @map("ended_at")
  viewerCount    Int        @default(0) @map("viewer_count")
  chatEnabled    Boolean    @default(true) @map("chat_enabled")
  requireAuth    Boolean    @default(true) @map("require_auth")
  invitation     Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  chatMessages    ChatMessage[]
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@map("livestreams")
}

model ChatMessage {
  id             String      @id @default(uuid())
  livestreamId   String      @map("livestream_id")
  guestId        String      @map("guest_id")
  message        String
  type           String      @default("text") // 'text' | 'sticker' | 'reaction'
  livestream     Livestream  @relation(fields: [livestreamId], references: [id], onDelete: Cascade)
  guest          Guest       @relation(fields: [guestId], references: [id], onDelete: Cascade)
  createdAt      DateTime    @default(now())

  @@index([livestreamId, createdAt])
  @@map("chat_messages")
}

model GuestPhoto {
  id               String   @id @default(uuid())
  invitationId     String   @map("invitation_id")
  guestId          String?  @map("guest_id") // nullable = anonymous upload
  photoUrl         String   @map("photo_url")
  thumbnailUrl     String?  @map("thumbnail_url")
  caption          String?
  moderationStatus String   @default("pending") @map("moderation_status") // 'pending' | 'approved' | 'rejected'
  aiTags          String[]  @default([]) @map("ai_tags") // ['bride', 'groom', 'dance', 'ceremony']
  likes           Int       @default(0)
  invitation      Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  guest           Guest?    @relation(fields: [guestId], references: [id], onDelete: SetNull)
  createdAt       DateTime  @default(now())

  @@index([invitationId, moderationStatus])
  @@map("guest_photos")
}

model Payment {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  guestId      String?  @map("guest_id")
  type         String   // 'subscription' | 'gift'
  amount       Int      // in VND cents or smallest currency unit
  currency     String   @default("VND")
  status       String   @default("pending") // 'pending' | 'completed' | 'failed' | 'refunded'
  provider     String   // 'stripe' | 'momo' | 'zalopay' | 'bank_transfer'
  providerId   String?  @map("provider_id") // Transaction ID from provider
  metadata     Json?
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  guest        Guest?   @relation(fields: [guestId], references: [id], onDelete: SetNull)
  createdAt    DateTime @default(now())

  @@index([userId, status])
  @@index([guestId])
  @@map("payments")
}

model AISuggestion {
  id           String     @id @default(uuid())
  invitationId String     @map("invitation_id")
  type         String     // 'layout' | 'music' | 'story' | 'photo_storytelling'
  input        Json       // What was analyzed
  suggestions  Json       // AI-generated options array
  selected     Json?      // User's choice
  confidence   Float?
  invitation   Invitation @relation(fields: [invitationId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@index([invitationId, type])
  @@map("ai_suggestions")
}
```

### 2.3 Required Schema Updates for Existing Models

When adding Phase 2-4 models, the following fields need to be added to existing models:

```prisma
// Add to User model:
model User {
  // ... existing fields ...
  role              String    @default("couple")     // 'couple' | 'admin'
  stripeCustomerId  String?   @map("stripe_customer_id")
  stripeSubscriptionId String? @map("stripe_subscription_id")
  planExpiresAt     DateTime? @map("plan_expires_at")
  customDomain      String?   @map("custom_domain")
  bankQR            String?   @map("bank_qr")        // QR cho chuyển khoản
  momoEnabled       Boolean   @default(false) @map("momo_enabled")
  payments          Payment[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@map("users")
}

// Add to Invitation model:
model Invitation {
  // ... existing fields ...
  heroVideo      String?    @map("hero_video")
  musicUrl       String?    @map("music_url")
  musicAutoplay  Boolean    @default(false) @map("music_autoplay")
  musicFadeIn    Boolean    @default(true) @map("music_fade_in")
  sections       Json?      // Ordered section config: [{type, order, config, content}]
  secondaryColor String?    @map("secondary_color")
  customCSS      String?    @map("custom_css")
  mapUrl         String?    @map("map_url")
  latitude       Float?
  longitude      Float?
  status         String     @default("draft") @map("status") // 'draft' | 'published' | 'archived'
  voiceMessages  VoiceMessage[]
  livestreams    Livestream[]
  guestPhotos    GuestPhoto[]
  aiSuggestions  AISuggestion[]
  payments       Payment[]
  // ... existing relations ...
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  @@map("invitations")
}

// Add to Guest model:
model Guest {
  // ... existing fields ...
  relationship    String?    // 'family' | 'friend' | 'colleague'
  memoryStory     String?    @map("memory_story")
  qrCodeUrl       String?    @map("qr_code_url")    // S3 URL to QR PNG
  shortUrl        String?    @unique @map("short_url") // /g/abc123
  specialRequest  String?    @map("special_request")
  giftCurrency    String?    @default("VND") @map("gift_currency")
  giftIsAnonymous Boolean    @default(false) @map("gift_is_anonymous")
  giftTransactionId String?  @map("gift_transaction_id")
  thankYouSent    Boolean    @default(false) @map("thank_you_sent")
  thankYouSentAt  DateTime?  @map("thank_you_sent_at")
  voiceMessages   VoiceMessage[]
  chatMessages    ChatMessage[]
  guestPhotos     GuestPhoto[]
  payments        Payment[]
  // ... existing relations ...
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([shortUrl])
  @@map("guests")
}
```

### 2.4 Migration Strategy

```bash
# Add new models incrementally per phase:
npx prisma migrate dev --name add_voice_messages    # Phase 4
npx prisma migrate dev --name add_livestreams       # Phase 4
npx prisma migrate dev --name add_payments          # Phase 4
npx prisma migrate dev --name add_guest_photos      # Phase 4
npx prisma migrate dev --name add_ai_suggestions    # Phase 3
npx prisma migrate dev --name add_user_payment_fields  # Phase 4
npx prisma migrate dev --name add_invitation_sections  # Phase 2

# After each migration, regenerate client:
npx prisma generate
```

