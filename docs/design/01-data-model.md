# Data Model

## Invitation Data

```typescript
interface InvitationData {
  // Core content (editable in Content Tab)
  title: string;           // SEO title, hiển thị trên tab browser
  subtitle: string | null; // Hiển thị trên Hero section
  groomName: string;
  brideName: string;
  weddingDate: string;     // ISO 8601
  venue: string | null;
  venueAddress: string | null;
  ceremonyTime: string | null;
  receptionTime: string | null;
  story: string | null;    // Supports \n for paragraphs

  // Visual design (editable in Design Tab)
  template: string;        // cinematic | elegant | modern | minimal | vintage
  primaryColor: string;    // Hex color, default #c8956c
  secondaryColor: string | null;
  fontFamily: string;
  coverPhoto: string | null;

  // Section configuration (editable in Sections Tab)
  sections: SectionConfig[];

  // Media
  gallery: string[];
  musicUrl: string | null;
  musicAutoplay: boolean;
  musicFadeIn: boolean;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
}
```

## Section Configuration

```typescript
interface SectionConfig {
  id: string;           // Unique identifier
  type: SectionType;    // One of 9 section types
  order: number;        // Display order (0-based)
  visible: boolean;     // Show/hide section
  config: Record<string, any>; // Section-specific settings → xem file từng section
}

type SectionType =
  | 'hero'      // Landing section with couple names
  | 'story'     // Love story text with image
  | 'event'     // Wedding event details
  | 'rsvp'      // Guest RSVP form
  | 'gallery'   // Photo gallery
  | 'countdown' // Countdown timer
  | 'map'       // Location map
  | 'music'     // Background music player
  | 'gift';     // Digital gift/money transfer
```

## Dynamic Event System

Thay thế cấu trúc cố định `ceremonyTime`/`receptionTime`, hỗ trợ tối đa 3 sự kiện tùy chỉnh:

```typescript
interface EventItem {
  name: string;       // "Lễ Vu Quy", "Lễ Thành Hôn", "Tiệc Cưới"
  time: string;       // "10:00"
  venue: string;      // "Nhà hàng ABC"
  address: string;    // "123 Đường XYZ, Q.1, TP.HCM"
  dressCode?: string; // "Áo dài / Vest"
  mapUrl?: string;    // Google Maps link
}

interface EventConfig {
  events: EventItem[];     // Mảng sự kiện (tối đa 3)
  showDressCode: boolean;
}
```

## Gift Config (Bride/Groom Family)

```typescript
interface GiftConfig {
  methods: ('momo' | 'zalopay' | 'bank_transfer' | 'stripe')[];
  showBankQR: boolean;
  customMessage: string;
  showBrideSide: boolean;   // Hiển thị thông tin nhà gái
  showGroomSide: boolean;   // Hiển thị thông tin nhà trai
  brideQR: string;          // URL ảnh QR nhà gái
  groomQR: string;          // URL ảnh QR nhà trai
  brideBankInfo: string;    // Thông tin chuyển khoản nhà gái
  groomBankInfo: string;    // Thông tin chuyển khoản nhà trai
}
```

## Guest Data

```typescript
interface GuestData {
  name: string;
  phone?: string;
  rsvp?: {
    status: 'attending' | 'maybe' | 'declined';
    attendees: number;
    dietary: string[];
  };
  personalization?: {
    customMessage?: string;
    sharedPhoto?: string;
  };
}
```
