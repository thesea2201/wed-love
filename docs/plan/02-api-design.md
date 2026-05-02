# API Design

> Part of [TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md)

## 3. API Design

### 3.1 RESTful API Structure

```
/api/v1
├── /auth                          ✅ IMPLEMENTED
│   ├── POST /register             ✅ Register + return JWT
│   ├── POST /login                ✅ Login + return JWT
│   └── GET  /me                   ✅ Get current user (auth required)
│
├── /invitations                   ✅ IMPLEMENTED
│   ├── GET    /                   ✅ List user's invitations (auth)
│   ├── POST   /                   ✅ Create invitation (auth)
│   ├── GET    /:slug              ✅ Public view (?token=guest-uuid)
│   ├── PATCH  /:id               ✅ Update (auth, owner only)
│   ├── POST   /:id/publish       ✅ Publish (auth)
│   ├── POST   /:id/duplicate     ✅ Duplicate (auth)
│   ├── DELETE /:id               ❌ TODO
│   └── GET    /:id/analytics     ✅ Dashboard stats (auth)
│
├── /guests                        ✅ IMPLEMENTED
│   ├── GET    /                   ✅ List with filters & pagination (auth)
│   ├── POST   /                   ✅ Add single guest (auth)
│   ├── POST   /bulk               ✅ Bulk import (auth)
│   ├── POST   /:token/rsvp       ✅ Public RSVP endpoint
│   ├── GET    /export             ✅ Export guests (auth)
│   ├── GET    /:token             ❌ TODO — Get by token (public)
│   ├── PATCH  /:id               ❌ TODO — Update guest info
│   ├── DELETE /:id               ❌ TODO
│   ├── GET    /:token/personalized ❌ TODO — Get personalized content
│   └── GET    /qr-codes/batch    ❌ TODO — Batch QR download
│
├── /upload                        ✅ IMPLEMENTED (local mode)
│   ├── POST /presigned-url        ✅ Get upload URL (auth)
│   ├── POST /file                 ✅ Direct upload (auth, local storage)
│   └── GET  /serve/:subDir/:file  ✅ Serve uploaded files
│
├── /voice-messages                ❌ Phase 4
│   ├── POST   /                   # Upload voice/video
│   ├── GET    /                   # List (couple view, auth)
│   ├── PATCH  /:id/moderate       # Approve/reject (auth)
│   └── GET    /public             # Public gallery
│
├── /gifts                         ❌ Phase 4
│   ├── POST   /                   # Create gift intent
│   ├── POST   /:id/confirm        # Confirm payment
│   └── GET    /stats               # Dashboard stats (auth)
│
├── /livestreams                   ❌ Phase 4
│   ├── POST   /                   # Create stream (auth)
│   ├── GET    /:id                 # Get stream info
│   ├── POST   /:id/start          # Start stream (auth)
│   ├── POST   /:id/end            # End stream (auth)
│   └── GET    /:id/chat            # Chat history
│
├── /ai                            ❌ Phase 3
│   ├── POST   /suggest-layout     # AI Photo Storytelling
│   ├── POST   /suggest-music      # Music recommendations
│   ├── POST   /generate-story     # AI Writing Assistant
│   ├── POST   /analyze-photos     # Photo tag generation
│   └── POST   /transcribe         # Whisper transcription
│
├── /guest-photos                  ❌ Phase 4
│   ├── POST   /                   # Upload from guest
│   ├── GET    /                   # Gallery view
│   ├── PATCH  /:id/moderate       # Approve/reject (auth)
│   └── POST   /:id/like           # Like photo
│
└── /webhooks                      ❌ Phase 4
    ├── POST   /stripe              # Stripe webhook
    ├── POST   /momo                # MoMo webhook
    └── POST   /zalopay             # ZaloPay webhook
```

### 3.2 Existing API Specifications (Phase 1)

#### POST /auth/register
```typescript
// Request
interface RegisterRequest {
  email: string;
  password: string;
  groomName: string;
  brideName: string;
  weddingDate: string; // ISO date string
}

// Response 201
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    groomName: string;
    brideName: string;
    weddingDate: string;
  };
}
```

#### POST /auth/login
```typescript
// Request
{ email: string; password: string; }

// Response 200 — same shape as AuthResponse
```

#### GET /invitations/:slug?token=xxx
```typescript
// Response 200 (public, with optional guest token)
interface InvitationViewResponse {
  invitation: {
    id: string;
    slug: string;
    template: string;
    title: string;
    subtitle: string | null;
    primaryColor: string;
    fontFamily: string;
    groomName: string;
    brideName: string;
    weddingDate: string;
    venue: string | null;
    venueAddress: string | null;
    ceremonyTime: string | null;
    receptionTime: string | null;
    story: string | null;
    coverPhoto: string | null;
    gallery: string[];
    isPublished: boolean;
  };
  guest: {
    name: string;
    personalization: {
      customMessage: string | null;
      sharedPhoto: string | null;
    };
    rsvp: {
      status: string;
      attendees: number;
    };
  } | null;
  isPersonalized: boolean;
}
```

#### POST /guests/bulk
```typescript
// Request (auth required, owner of invitation)
interface BulkImportRequest {
  invitationId: string;
  guests: Array<{
    name: string;           // Required
    email?: string;
    phone?: string;
    customMessage?: string;
    sharedPhoto?: string;
    tableNumber?: string;
  }>;
}

// Response 200
interface BulkImportResponse {
  imported: number;
  failed: Array<{ row: number; reason: string }>;
}
```

#### POST /guests/:token/rsvp
```typescript
// Request (public, no auth)
interface RSVPRequest {
  status: 'attending' | 'declined' | 'maybe';
  attendees?: number;
  dietary?: string[];
}

// Response 200
interface RSVPResponse {
  success: boolean;
  guest: {
    name: string;
    rsvpStatus: string;
    rsvpAttendees: number;
  };
}
```

### 3.3 New API Specifications (Phase 2-4)

#### POST /voice-messages (Phase 4)
```typescript
// Request (guest token in header or body)
interface VoiceMessageCreate {
  guestToken: string;
  invitationId: string;
  type: 'audio' | 'video';
  fileKey: string;        // From /upload/presigned-url
  duration: number;       // seconds
  isPublic?: boolean;
}

// Response 201
interface VoiceMessageResponse {
  id: string;
  type: string;
  fileUrl: string;
  duration: number;
  transcript: string | null;
  moderationStatus: string;
  createdAt: string;
}
```

#### POST /gifts (Phase 4)
```typescript
// Request (guest token required)
interface GiftCreateRequest {
  guestToken: string;
  amount: number;          // in VND
  currency?: string;       // default 'VND'
  message?: string;
  isAnonymous?: boolean;
}

// Response 200 — returns available payment methods
interface GiftCreateResponse {
  txnId: string;
  methods: Array<{
    type: 'bank_transfer' | 'stripe' | 'momo' | 'zalopay';
    qrImage?: string;      // For bank transfer
    clientSecret?: string; // For Stripe
    payUrl?: string;       // For MoMo/ZaloPay
  }>;
}
```

#### POST /ai/generate-story (Phase 3)
```typescript
// Request (auth required)
interface StoryGenerateRequest {
  invitationId: string;
  coupleNames: string;
  howTheyMet?: string;
  memorableMoment?: string;
  style: 'romantic' | 'humorous' | 'formal' | 'poetic';
  length?: 'short' | 'medium' | 'long';
}

// Response 200
interface StoryGenerateResponse {
  suggestions: Array<{
    title: string;
    text: string;
  }>;
}
```

#### POST /ai/analyze-photos (Phase 3)
```typescript
// Request (auth required, multipart/form-data)
// files: File[] — 10-50 photos

// Response 200
interface PhotoAnalysisResponse {
  mood: 'romantic_warm' | 'elegant_cool' | 'vibrant' | 'minimal';
  colorPalette: Array<[number, number, number]>; // RGB tuples
  hasCouplePhotos: boolean;
  hasFamilyPhotos: boolean;
  suggestedTemplates: string[];
  suggestedMusic: Array<{ id: string; title: string; mood: string }>;
  storySuggestions?: Array<{ title: string; text: string }>;
}
```
