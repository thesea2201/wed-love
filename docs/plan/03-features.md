# Feature Implementation Details

> Part of [TECHNICAL_PLAN.md](../TECHNICAL_PLAN.md)

## 4. Feature Implementation Details

### 4.0 Phase 1 Remaining Tasks (1.11-1.12)

#### 1.11 Connect Frontend to Real API

**Current state:** `AuthPage` calls real API, but `InvitationView` and `AdminDashboard` use hardcoded mock data.

**Implementation plan:**
```typescript
// 1. API client already exists at client/src/utils/api.ts
//    - axios instance with JWT interceptor ✅
//    - 401 → auto-logout ✅

// 2. Create typed API functions
// client/src/utils/invitation-api.ts
import api from './api';

export const invitationApi = {
  list: () => api.get('/invitations'),
  create: (data: CreateInvitationDto) => api.post('/invitations', data),
  getBySlug: (slug: string, token?: string) =>
    api.get(`/invitations/${slug}${token ? `?token=${token}` : ''}`),
  update: (id: string, data: Partial<Invitation>) => api.patch(`/invitations/${id}`, data),
  publish: (id: string) => api.post(`/invitations/${id}/publish`),
  duplicate: (id: string) => api.post(`/invitations/${id}/duplicate`),
  analytics: (id: string) => api.get(`/invitations/${id}/analytics`),
};

// client/src/utils/guest-api.ts
export const guestApi = {
  list: (invitationId: string, params?: { status?: string; page?: number }) =>
    api.get('/guests', { params: { invitationId, ...params } }),
  add: (data: AddGuestDto) => api.post('/guests', data),
  bulkImport: (invitationId: string, guests: GuestInput[]) =>
    api.post('/guests/bulk', { invitationId, guests }),
  rsvp: (token: string, data: RSVPDto) => api.post(`/guests/${token}/rsvp`, data),
  export: (invitationId: string) => api.get('/guests/export', { params: { invitationId } }),
};

// 3. Replace mock data in pages with React Query hooks
// client/src/hooks/useInvitation.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationApi } from '../utils/invitation-api';

export const useInvitation = (slug: string, token?: string) => {
  return useQuery({
    queryKey: ['invitation', slug, token],
    queryFn: () => invitationApi.getBySlug(slug, token),
    staleTime: 5 * 60 * 1000,
  });
};

// 4. Update components to use hooks instead of hardcoded data
// InvitationView.tsx — replace mock data with useInvitation(slug, token)
// AdminDashboard.tsx — replace mock data with invitationApi.list() + guestApi.list()
```

#### 1.12 Media Upload (S3 Integration)

**Current state:** `upload.routes.ts` works with local file storage. S3 mode is stubbed.

**Implementation plan:**
```typescript
// server/src/routes/upload.routes.ts — add S3 support
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: process.env.AWS_REGION! });

// Replace presigned-url endpoint:
router.post('/presigned-url', authenticate, async (req, res) => {
  const { fileName, contentType } = req.body;
  const key = `uploads/${crypto.randomUUID()}/${fileName}`;

  if (process.env.AWS_S3_BUCKET) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const publicUrl = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`;
    res.json({ uploadUrl, key, publicUrl });
  } else {
    // Local fallback (existing code)
    res.json({ uploadUrl: '/api/v1/upload/file', key, publicUrl: `/api/v1/upload/serve/${key}` });
  }
});
```

---

### 4.A Phase 2: Personalization & Polish

#### A.1 Excel/CSV Import với Personalization

**Frontend (SheetJS):**
```typescript
// client/src/components/GuestImport/ExcelUploader.tsx
import * as XLSX from 'xlsx';

interface ImportMapping {
  name: string;           // Required
  email?: string;
  phone?: string;
  relationship?: string;
  customMessage?: string;
  memoryStory?: string;
}

const parseExcel = async (file: File, mapping: ImportMapping): Promise<GuestInput[]> => {
  const workbook = XLSX.read(await file.arrayBuffer());
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const raw: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  return raw.slice(1) // Skip header row
    .filter(row => row.some(cell => cell != null))
    .map((row, index) => ({
      name: String(row[mapping.name] || '').trim(),
      email: mapping.email ? String(row[mapping.email] || '').trim() || undefined : undefined,
      phone: mapping.phone ? String(row[mapping.phone] || '').trim() || undefined : undefined,
      customMessage: mapping.customMessage ? String(row[mapping.customMessage] || '').trim() || undefined : undefined,
      memoryStory: mapping.memoryStory ? String(row[mapping.memoryStory] || '').trim() || undefined : undefined,
    }))
    .filter(g => g.name.length > 0); // Must have name
};

// Upload to existing /guests/bulk endpoint
const handleImport = async (file: File, mapping: ImportMapping, invitationId: string) => {
  const guests = await parseExcel(file, mapping);
  const result = await guestApi.bulkImport(invitationId, guests);
  return result; // { imported: number, failed: Array<{row, reason}> }
};
```

**Backend:** Already implemented in `guest.routes.ts` — `POST /guests/bulk` uses `prisma.guest.createMany()`.

#### A.2 QR Code Generation

**Implementation:**
```typescript
// server/src/services/qr-code.service.ts
import QRCode from 'qrcode';
import crypto from 'crypto';
import { prisma } from '../config/database';

export class QRCodeService {
  async generateForGuest(guestId: string): Promise<{ qrCodeUrl: string; shortUrl: string }> {
    const guest = await prisma.guest.findUnique({ where: { id: guestId } });
    if (!guest) throw new Error('Guest not found');

    // Generate short URL slug
    const shortUrl = crypto.randomBytes(4).toString('hex');

    // Generate QR code as data URL
    const fullUrl = `${process.env.FRONTEND_URL}/invitation/${guest.invitationId}?token=${guest.token}`;
    const qrDataUrl = await QRCode.toDataURL(fullUrl, {
      width: 400, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    // Upload QR to S3 (or save locally)
    // ... upload logic ...

    // Update guest record
    await prisma.guest.update({
      where: { id: guestId },
      data: { qrCodeUrl: qrDataUrl, shortUrl },
    });

    return { qrCodeUrl: qrDataUrl, shortUrl };
  }

  async generateBatch(invitationId: string): Promise<string> {
    const guests = await prisma.guest.findMany({
      where: { invitationId },
      select: { id: true },
    });

    for (const guest of guests) {
      await this.generateForGuest(guest.id);
    }

    return `/api/v1/guests/qr-codes/batch?invitationId=${invitationId}`;
  }
}
```

**Frontend route for QR redirect:**
```typescript
// client/src/App.tsx — add short URL route
<Route path="/g/:shortUrl" element={<QRRedirect />} />

// client/src/pages/QRRedirect.tsx
export const QRRedirect = () => {
  const { shortUrl } = useParams();
  // Look up guest by shortUrl, redirect to /invitation/:slug?token=xxx
  const { data } = useQuery({
    queryKey: ['qr', shortUrl],
    queryFn: () => api.get(`/guests/resolve-short-url/${shortUrl}`),
  });

  useEffect(() => {
    if (data) window.location.href = `/invitation/${data.slug}?token=${data.token}`;
  }, [data]);

  return <div>Đang chuyển hướng...</div>;
};
```

#### A.3 More Templates (5 Total)

**Current:** Only "cinematic" template exists.

**Templates to add:**
| Template | Style | Key Features |
|----------|-------|-------------|
| `cinematic` | ✅ Done | Parallax hero, fade-in sections, dark overlay |
| `elegant` | Classic | Serif fonts, gold accents, floral borders |
| `modern` | Minimal | Sans-serif, clean lines, bold colors |
| `minimal` | Ultra-clean | White space, thin typography, subtle animations |
| `vintage` | Retro | Sepia tones, script fonts, paper texture |

**Implementation approach:**
```typescript
// Each template = a set of section components + theme config
// client/src/components/templates/
//   cinematic/  ← existing sections
//   elegant/    ← new section variants
//   modern/
//   minimal/
//   vintage/

// Template registry
const TEMPLATES: Record<string, TemplateConfig> = {
  cinematic: {
    name: 'Cinematic',
    primaryColor: '#d4a574',
    fontFamily: 'Playfair Display',
    sections: { hero: CinematicHero, story: CinematicStory, ... }
  },
  elegant: {
    name: 'Elegant',
    primaryColor: '#c9a96e',
    fontFamily: 'Cormorant Garamond',
    sections: { hero: ElegantHero, story: ElegantStory, ... }
  },
  // ...
};

// InvitationView dynamically renders based on invitation.template
const TemplateComponent = TEMPLATES[invitation.template]?.sections[section.type]
  || TEMPLATES.cinematic.sections[section.type];
```

#### A.4 Music Player

```typescript
// client/src/components/MusicPlayer.tsx
export const MusicPlayer = ({ url, autoplay, fadeIn }: { url: string; autoplay: boolean; fadeIn: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (autoplay && audioRef.current) {
      // Browser requires user interaction first — show "tap to play" overlay
      const handleFirstInteraction = () => {
        audioRef.current?.play();
        setPlaying(true);
        document.removeEventListener('click', handleFirstInteraction);
      };
      document.addEventListener('click', handleFirstInteraction);
    }
  }, [autoplay]);

  const togglePlay = () => {
    if (playing) audioRef.current?.pause();
    else audioRef.current?.play();
    setPlaying(!playing);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio ref={audioRef} src={url} loop preload="none" />
      <button onClick={togglePlay} className="...">
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
};
```

#### A.5 Gallery Section + Lightbox

```typescript
// client/src/components/GallerySection.tsx
import { motion, AnimatePresence } from 'framer-motion';

export const GallerySection = ({ photos }: { photos: string[] }) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section className="gallery">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {photos.map((url, i) => (
          <motion.img
            key={i} src={url}
            onClick={() => setSelected(i)}
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer rounded"
          />
        ))}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setSelected(null)}
          >
            <img src={photos[selected]} className="max-h-[90vh] max-w-[90vw] object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
```

#### A.6 Countdown Timer

```typescript
// client/src/components/CountdownTimer.tsx
export const CountdownTimer = ({ weddingDate }: { weddingDate: string }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(weddingDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(weddingDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  if (timeLeft.total <= 0) return <span>Hôm nay là ngày vui!</span>;

  return (
    <div className="flex gap-4 text-center">
      {[
        { value: timeLeft.days, label: 'Ngày' },
        { value: timeLeft.hours, label: 'Giờ' },
        { value: timeLeft.minutes, label: 'Phút' },
        { value: timeLeft.seconds, label: 'Giây' },
      ].map(({ value, label }) => (
        <div key={label} className="flex flex-col">
          <span className="text-4xl font-bold">{value}</span>
          <span className="text-sm uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
};
```

---

### 4.B Phase 4: Social & Interaction Features

#### B.1 Digital Gift (E-Shagun)

**UI Flow:**
```
Guest clicks "Gửi mừng" → Modal chọn số tiền
→ Toggle "Ẩn danh" → Chọn phương thức (Bank/Stripe/Momo)
→ Nhập lời chúc → Xác nhận → Success animation
```

**Backend (TypeScript + Prisma):**
```typescript
// server/src/services/gift.service.ts
import Stripe from 'stripe';
import { prisma } from '../config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class GiftService {
  async createGiftIntent(guestToken: string, amount: number, isAnonymous: boolean, message?: string) {
    const guest = await prisma.guest.findUnique({ where: { token: guestToken } });
    if (!guest) throw new Error('Guest not found');

    const invitation = await prisma.invitation.findUnique({
      where: { id: guest.invitationId },
      include: { user: true },
    });
    if (!invitation) throw new Error('Invitation not found');

    const txnId = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const methods: PaymentMethod[] = [];

    // Bank Transfer QR (from couple's settings)
    if (invitation.user.bankQR) {
      methods.push({
        type: 'bank_transfer',
        qrImage: invitation.user.bankQR,
        instructions: 'Quét mã QR để chuyển khoản',
      });
    }

    // Stripe for international
    if (invitation.user.stripeCustomerId) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // already in cents
        currency: 'usd',
        metadata: { guestId: guest.id, txnId },
      });
      methods.push({
        type: 'stripe',
        clientSecret: paymentIntent.client_secret!,
      });
    }

    // MoMo for Vietnam
    if (invitation.user.momoEnabled) {
      const momoResponse = await this.createMoMoPayment(txnId, amount);
      methods.push({ type: 'momo', payUrl: momoResponse.payUrl });
    }

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: invitation.userId,
        guestId: guest.id,
        type: 'gift',
        amount,
        currency: 'VND',
        status: 'pending',
        provider: 'pending', // Will be updated on confirmation
        providerId: txnId,
        metadata: { isAnonymous, message },
      },
    });

    return { txnId, methods };
  }

  async confirmGift(txnId: string, provider: string, providerTransactionId: string) {
    const payment = await prisma.payment.findFirst({
      where: { providerId: txnId },
      include: { guest: true },
    });
    if (!payment) throw new Error('Payment not found');

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'completed', provider, providerId: providerTransactionId },
      }),
      prisma.guest.update({
        where: { id: payment.guestId! },
        data: {
          giftAmount: payment.amount,
          giftMessage: (payment.metadata as any)?.message,
          giftMethod: provider,
          giftPaidAt: new Date(),
          giftIsAnonymous: (payment.metadata as any)?.isAnonymous ?? false,
        },
      }),
    ]);

    // Real-time notification to couple via Socket.io
    // io.to(`user:${payment.userId}`).emit('gift_received', { ... });
  }
}
```

#### B.2 Voice/Video Messages

**Frontend (MediaRecorder API):**
```typescript
// client/src/components/VoiceRecorder/VoiceRecorder.tsx
export const VoiceRecorder = ({ invitationId, guestToken }: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: true,
    });
    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9,opus',
    });
    mediaRecorder.current.ondataavailable = (e) => chunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' });
      await uploadVoiceMessage(blob);
      chunks.current = [];
    };
    mediaRecorder.current.start(1000);
    setIsRecording(true);
  };

  const uploadVoiceMessage = async (blob: Blob) => {
    // 1. Get presigned URL
    const { uploadUrl, key, publicUrl } = await api.post('/upload/presigned-url', {
      fileName: `voice-${Date.now()}.webm`,
      contentType: blob.type,
    });

    // 2. Upload to S3/local
    await axios.put(uploadUrl, blob, {
      headers: { 'Content-Type': blob.type },
    });

    // 3. Create voice message record
    await api.post('/voice-messages', {
      guestToken,
      invitationId,
      type: 'video',
      fileKey: publicUrl || key,
      duration: recordedDuration,
    });
  };
};
```

**Backend transcription (Bull queue + OpenAI Whisper):**
```typescript
// server/src/workers/transcribe.worker.ts
import { Queue, Worker } from 'bullmq';
import OpenAI from 'openai';
import { prisma } from '../config/database';
import { downloadFromS3 } from '../utils/s3';

const transcribeQueue = new Queue('transcribe', { connection: redisConnection });

// Add job when voice message is created:
// transcribeQueue.add('transcribe', { voiceMessageId, fileUrl });

const worker = new Worker('transcribe', async (job) => {
  const { voiceMessageId, fileUrl } = job.data;

  const audioBuffer = await downloadFromS3(fileUrl);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const transcription = await openai.audio.transcriptions.create({
    file: new File([audioBuffer], 'audio.webm', { type: 'audio/webm' }),
    model: 'whisper-1',
    language: 'vi',
  });

  await prisma.voiceMessage.update({
    where: { id: voiceMessageId },
    data: { transcript: transcription.text },
  });
}, { connection: redisConnection });
```

#### B.3 Livestream Integration

**Architecture:**
```
Couple streams via OBS/Phone → RTMP → Mux/Cloudflare
                                    ↓
                            HLS playlist
                                    ↓
                            React Player (hls.js)
                                    ↓
                        Socket.io (chat + presence)
```

**Mux Integration (TypeScript):**
```typescript
// server/src/services/livestream.service.ts
import Mux from '@mux/mux-node';
import { prisma } from '../config/database';

const { Video } = new Mux(process.env.MUX_TOKEN_ID!, process.env.MUX_TOKEN_SECRET!);

export class LivestreamService {
  async createLivestream(invitationId: string, scheduledAt?: Date) {
    const stream = await Video.LiveStreams.create({
      playback_policy: ['public'],
      new_asset_settings: { playback_policy: ['public'] },
    });

    const livestream = await prisma.livestream.create({
      data: {
        invitationId,
        provider: 'mux',
        streamKey: stream.stream_key,
        playbackId: stream.playback_ids[0].id,
        status: 'scheduled',
        scheduledAt: scheduledAt || null,
      },
    });

    return {
      streamKey: stream.stream_key, // For OBS: rtmp://live.mux.com/app/{streamKey}
      playbackUrl: `https://stream.mux.com/${stream.playback_ids[0].id}.m3u8`,
    };
  }

  async handleMuxWebhook(event: MuxWebhookEvent) {
    const livestream = await prisma.livestream.findFirst({
      where: { playbackId: event.data.playback_id },
    });
    if (!livestream) return;

    switch (event.type) {
      case 'video.live_stream.active':
        await prisma.livestream.update({
          where: { id: livestream.id },
          data: { status: 'live', startedAt: new Date() },
        });
        // Notify guests via Socket.io
        break;
      case 'video.live_stream.idle':
        await prisma.livestream.update({
          where: { id: livestream.id },
          data: { status: 'ended', endedAt: new Date() },
        });
        break;
    }
  }
}
```

**Chat Implementation (Socket.io + Redis):**
```typescript
// server/src/socket/chat.handler.ts
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { prisma } from '../config/database';

export const setupChat = (io: Server) => {
  const livestreamNs = io.of('/livestream');

  livestreamNs.on('connection', async (socket) => {
    const { livestreamId, guestToken } = socket.handshake.query;

    // Verify guest
    const guest = await prisma.guest.findUnique({ where: { token: guestToken as string } });
    if (!guest) return socket.disconnect();

    socket.join(`livestream:${livestreamId}`);

    socket.on('chat:message', async (data: { message: string; type: string }) => {
      // Rate limiting: 5 msg/min per guest
      // ... rate limit check ...

      const msg = await prisma.chatMessage.create({
        data: {
          livestreamId: livestreamId as string,
          guestId: guest.id,
          message: data.message,
          type: data.type || 'text',
        },
      });

      livestreamNs.to(`livestream:${livestreamId}`).emit('chat:message', {
        id: msg.id,
        name: guest.name,
        message: data.message,
        createdAt: msg.createdAt,
      });
    });

    socket.on('chat:reaction', (emoji: string) => {
      livestreamNs.to(`livestream:${livestreamId}`).emit('chat:reaction', {
        emoji,
        from: guest.name,
      });
    });
  });
};
```

---

### 4.C Phase 3: AI Features

#### C.1 AI Photo Storytelling

**Flow:**
```
User uploads 10-50 photos → AI analyze (mood, color, faces)
→ Gợi ý template + nhạc + thứ tự ảnh
→ Preview → User chọn → Auto-generate
```

**Node.js AI Service (NOT Python):**
```typescript
// server/src/services/ai.service.ts
import OpenAI from 'openai';
import { prisma } from '../config/database';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AIService {
  async analyzePhotos(invitationId: string, imageUrls: string[]) {
    // 1. Simple color analysis (no CV needed — use dominant color extraction)
    // For advanced CV, can add Python microservice later

    // 2. Send up to 5 images to GPT-4V for story analysis
    const base64Images = await Promise.all(
      imageUrls.slice(0, 5).map(url => this.urlToBase64(url))
    );

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Phân tích các bức ảnh cưới này. Trả về JSON: { mood, suggestedTemplates: string[], suggestedMusic: [{title, mood}], storySuggestions: [{title, text}] }' },
          ...base64Images.map(img => ({
            type: 'image_url' as const,
            image_url: { url: `data:image/jpeg;base64,${img}` },
          })),
        ],
      }],
      response_format: { type: 'json_object' },
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');

    // Cache the suggestion
    await prisma.aISuggestion.create({
      data: {
        invitationId,
        type: 'photo_storytelling',
        input: { imageCount: imageUrls.length },
        suggestions: analysis,
        confidence: 0.8,
      },
    });

    return analysis;
  }
}
```

#### C.2 AI Writing Assistant

**4 Writing Styles:**
```typescript
const WRITING_STYLES = [
  { id: 'romantic', label: 'Lãng mạn', prompt: 'Viết lời mời cưới lãng mạn, cảm xúc' },
  { id: 'humorous', label: 'Hài hước', prompt: 'Viết lời mời cưới hài hước, vui vẻ' },
  { id: 'formal', label: 'Trang trọng', prompt: 'Viết lời mời cưới trang trọng, truyền thống' },
  { id: 'poetic', label: 'Thơ ca', prompt: 'Viết lời mời cưới theo phong cách thơ' },
] as const;
```

**Backend:**
```typescript
// server/src/services/ai.service.ts (continued)
async generateStory(invitationId: string, params: StoryGenerateRequest) {
  const systemPrompt = `Bạn là trợ lý viết lời mời cưới chuyên nghiệp.
  Viết theo phong cách ${params.style}.
  Thông tin cặp đôi: ${params.coupleNames}
  Câu chuyện: ${params.howTheyMet || 'N/A'}
  Kỷ niệm: ${params.memorableMoment || 'N/A'}
  Trả về JSON: { suggestions: [{ title, text }] }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: params.style === 'poetic'
        ? 'Viết 3 gợi ý lời mời cưới theo phong cách thơ ca, có vần điệu'
        : 'Viết 3 gợi ý lời mời cưới khác nhau' },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.8,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');

  await prisma.aISuggestion.create({
    data: {
      invitationId,
      type: 'story',
      input: params,
      suggestions: result.suggestions,
    },
  });

  return result;
}
```

**Frontend:**
```typescript
// client/src/components/AIAssistant/WritingAssistant.tsx
export const WritingAssistant = ({ invitationId, onSelect }: Props) => {
  const [style, setStyle] = useState<string>('romantic');
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const generate = async () => {
    setGenerating(true);
    const result = await api.post('/ai/generate-story', { invitationId, style, ... });
    setSuggestions(result.suggestions);
    setGenerating(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        {WRITING_STYLES.map(s => (
          <button key={s.id} onClick={() => setStyle(s.id)}
            className={style === s.id ? 'active' : ''}>{s.label}</button>
        ))}
      </div>
      <button onClick={generate} disabled={generating}>
        {generating ? 'Đang tạo...' : '✨ Gợi ý lời mời'}
      </button>
      <AnimatePresence>
        {suggestions.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => onSelect(s.text)} className="cursor-pointer">
            <h4>{s.title}</h4><p>{s.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

---

### 4.D Phase 4: Post-Wedding Management

#### D.1 Automated Thank You Messages

**Bull Queue Scheduler:**
```typescript
// server/src/services/post-wedding.service.ts
import { Queue } from 'bullmq';
import { prisma } from '../config/database';
import { aiService } from './ai.service';

const thankYouQueue = new Queue('thank-you', { connection: redisConnection });

export class PostWeddingService {
  async scheduleThankYouMessages(userId: string, weddingDate: Date) {
    const invitations = await prisma.invitation.findMany({
      where: { userId },
      select: { id: true },
    });

    const guests = await prisma.guest.findMany({
      where: {
        invitationId: { in: invitations.map(i => i.id) },
        OR: [
          { rsvpStatus: 'attending' },
          { giftAmount: { gt: 0 } },
        ],
      },
    });

    const sendAt = new Date(weddingDate);
    sendAt.setDate(sendAt.getDate() + 1); // Day after wedding

    for (const guest of guests) {
      await thankYouQueue.add('send-thank-you',
        { guestId: guest.id, userId },
        { delay: sendAt.getTime() - Date.now() },
      );
    }
  }
}

// Worker
const thankYouWorker = new Worker('thank-you', async (job) => {
  const { guestId, userId } = job.data;
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!guest || !user) return;

  // Generate personalized thank you with AI
  const thankYou = await aiService.generateThankYou(guest, user);

  // Send email (via SendGrid or similar)
  // await sendEmail({ to: guest.email, template: 'thank-you', data: { message: thankYou } });

  await prisma.guest.update({
    where: { id: guestId },
    data: { thankYouSent: true, thankYouSentAt: new Date() },
  });
}, { connection: redisConnection });
```

#### D.2 Guest Photo Upload Portal

**Frontend (Dropzone + client-side optimization):**
```typescript
// client/src/components/GuestPhotoUpload/GuestPhotoUpload.tsx
import { useDropzone } from 'react-dropzone';

export const GuestPhotoUpload = ({ invitationId, guestToken }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (files: File[]) => {
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Client-side optimization: resize + convert to WebP
      const optimized = await optimizeImage(file, { maxWidth: 2048, quality: 0.85 });

      // Get presigned URL
      const { uploadUrl, key, publicUrl } = await api.post('/upload/presigned-url', {
        fileName: file.name, contentType: 'image/webp',
      });

      // Upload
      await axios.put(uploadUrl, optimized, {
        headers: { 'Content-Type': 'image/webp' },
        onUploadProgress: (p) => setProgress(((i + p.loaded / p.total) / files.length) * 100),
      });

      // Create record
      await api.post('/guest-photos', { photoUrl: publicUrl || key, guestToken, invitationId });
    }
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true, maxFiles: 50,
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8 text-center cursor-pointer">
      <input {...getInputProps()} />
      <p>Kéo ảnh vào đây hoặc click để chọn</p>
      <em>(Tối đa 50 ảnh, mỗi ảnh không quá 20MB)</em>
      {uploading && <progress value={progress} max={100} />}
    </div>
  );
};
```

**Image optimization utility:**
```typescript
const optimizeImage = (file: File, opts: { maxWidth: number; quality: number }): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > opts.maxWidth) { height = (height * opts.maxWidth) / width; width = opts.maxWidth; }
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), 'image/webp', opts.quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
```
