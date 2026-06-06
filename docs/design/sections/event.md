# Event Section

> Chi tiết sự kiện cưới — hỗ trợ tối đa 3 sự kiện tùy chỉnh.

## Config

```typescript
{
  events: EventItem[];      // Mảng sự kiện (tối đa 3)
  showDressCode: boolean;   // Hiển thị dress code
}
```

```typescript
interface EventItem {
  name: string;       // "Lễ Vu Quy", "Lễ Thành Hôn", "Tiệc Cưới"
  time: string;       // "10:00"
  venue: string;      // "Nhà hàng ABC"
  address: string;    // "123 Đường XYZ, Q.1, TP.HCM"
  dressCode?: string; // "Áo dài / Vest"
  mapUrl?: string;    // Google Maps link riêng cho sự kiện này
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| events | `config.events` | Mảng EventItem |
| weddingDate | `invitation.weddingDate` | Hiển thị ngày |

**Fallback compatibility:** Nếu `config.events` trống/chưa có, fallback về:
- `invitation.ceremonyTime` + `invitation.venue` → Event "Lễ cưới"
- `invitation.receptionTime` + `invitation.venue` → Event "Tiệc cưới"

## Visual Behavior

- Mỗi event là 1 card với icon + thông tin
- Icons: Calendar (ngày), Clock (giờ), MapPin (địa điểm)
- Vietnamese date format: "Thứ Bảy, ngày 15 tháng 6 năm 2026" — ⚠️ chưa implement trong EventSection, chỉ hiển thị thời gian event
- Dress code badge hiển thị khi `showDressCode: true` và event có `dressCode`
- Nút "Chỉ đường" nếu event có `mapUrl`
- primaryColor áp dụng cho icons

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 8 cho container
- Events stack dọc (1 cột), mỗi event là 1 card riêng
- Icon dynamic color dùng `style` trên wrapper div, **không** trên SVG trực tiếp (SVG components không nhận `style` prop)

## Editor

- Cho phép thêm/xóa/sửa events (tối đa 3)
- Mỗi event có: name, time, venue, address, dressCode, mapUrl
- Nút "Thêm sự kiện" khi < 3 events

## Default Config

```json
{
  "events": [],
  "showDressCode": true
}
```

## File tham chiếu

- Component: `client/src/components/sections/EventSection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'event'
- Types: `client/src/types/index.ts` → EventItem, EventConfig
