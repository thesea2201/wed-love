# Data Model

## Invitation Data

```typescript
interface InvitationData {
  // System fields
  id: string;              // UUID
  slug: string;            // URL slug (unique)
  status: string;          // draft | published
  isPublished: boolean;
  publishedAt: string | null;

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

  // Media Pool (xem 06-media-library.md)
  // gallery = kho ảnh trung tâm, mọi ảnh upload đều vào đây
  // Sections tham chiếu ảnh từ gallery qua config fields
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
```

### Section Image Config (Media Library)

Các section cần ảnh sẽ lưu URL trong `config`, tham chiếu đến ảnh trong media pool (`gallery`):

```typescript
// Story section config
{ imageUrl?: string }       // Ảnh minh họa, chọn từ media pool

// Gallery section config
{ images?: string[] }       // Subset ảnh hiển thị. Rỗng = hiện toàn bộ pool

// Hero section: dùng invitation.coverPhoto (top-level field)
```

> Xem chi tiết: `06-media-library.md`

```typescript
type SectionType =
  | 'hero'      // Landing section with couple names
  | 'story'     // Love story text with image
  | 'event'     // Wedding event details
  | 'rsvp'      // Guest RSVP form
  | 'gallery'   // Photo gallery
  | 'countdown' // Countdown timer
  | 'map'       // Location map
  | 'music'     // Background music player
  | 'gift'      // Digital gift/money transfer
  // Phase 4 (chưa implement)
  | 'voice'      // Voice/video messages từ khách
  | 'livestream' // Livestream đám cưới
  | 'custom';    // Custom HTML section
```

## Dynamic Event System

Thay thế cấu trúc cố định `ceremonyTime`/`receptionTime`, hỗ trợ tối đa 3 sự kiện tùy chỉnh:

```typescript
interface EventItem {
  id: string;         // Unique identifier
  name: string;       // "Lễ Vu Quy", "Lễ Thành Hôn", "Tiệc Cưới"
  time: string;       // "10:00"
  venue: string;      // "Nhà hàng ABC"
  address: string;    // "123 Đường XYZ, Q.1, TP.HCM"
  dressCode: string;  // "Áo dài / Vest"
  mapUrl?: string;    // Google Maps link
}

interface EventConfig {
  events: EventItem[];     // Mảng sự kiện (tối đa 3)
  showDressCode: boolean;
}
```

## Gift Config (VietQR Integration)

```typescript
interface GiftConfig {
  customMessage: string;
  showBrideSide: boolean;        // Hiển thị thông tin nhà gái
  showGroomSide: boolean;        // Hiển thị thông tin nhà trai
  brideBankId: string;           // Mã ngân hàng nhà gái (VietQR bank ID)
  brideAccountNumber: string;    // Số tài khoản nhà gái
  brideAccountName: string;      // Tên chủ tài khoản nhà gái
  groomBankId: string;           // Mã ngân hàng nhà trai (VietQR bank ID)
  groomAccountNumber: string;    // Số tài khoản nhà trai
  groomAccountName: string;      // Tên chủ tài khoản nhà trai
  displayMode?: 'inline' | 'modal'; // inline = section, modal = floating button
}
```

## Guest Data

```typescript
interface GuestData {
  name: string;
  personalization: {
    customMessage: string | null;
    sharedPhoto: string | null;
  };
  rsvp: {
    status: string;
    attendees: number;
  };
}
```
