# Map Section

> Bản đồ địa điểm tổ chức đám cưới.

## Config

```typescript
{
  provider: 'google' | 'openstreetmap';
  showDirections: boolean;   // Nút "Chỉ đường"
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| venue | `invitation.venue` | Tên địa điểm |
| venueAddress | `invitation.venueAddress` | Địa chỉ đầy đủ |
| mapUrl | `invitation.mapUrl` | URL embed map |
| latitude | `invitation.latitude` | GPS (optional) |
| longitude | `invitation.longitude` | GPS (optional) |

## Visual Behavior

- Map embed iframe hoặc static map image
- Tên và địa chỉ hiển thị trên/dưới map
- Nút "Chỉ đường" link đến Google Maps (khi `showDirections: true`)
- Fallback: hiện text địa chỉ nếu không có map URL
- Hỗ trợ cả share link (mở tab mới) và embedded iframe

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 8 cho container
- Map iframe: `w-full`, chiều cao cố định `h-64 md:h-80`
- Border radius: `rounded-xl` cho iframe container

## Default Config

```json
{
  "provider": "google",
  "showDirections": true
}
```

## File tham chiếu

- Component: `client/src/components/sections/MapSection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'map'
