# Map Section

> Bản đồ địa điểm tổ chức đám cưới.

## Config

```typescript
{
  embedUrl: string;          // URL iframe embed (Google Maps / OpenStreetMap)
  // (Future) Chưa implement:
  // provider: 'google' | 'openstreetmap';
  // showDirections: boolean;   // Nút "Chỉ đường"
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

- Map embed iframe (`aspect-video`)
- Tên và địa chỉ hiển thị bên dưới map
- Priority: `config.embedUrl` > `invitation.mapUrl` > default embed URL
- Fallback: sử dụng hardcoded default embed URL

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 8 cho container
- Map iframe: `w-full`, chiều cao cố định `h-64 md:h-80`
- Border radius: `rounded-xl` cho iframe container

## Default Config

```json
{
  "embedUrl": ""
}
```

## File tham chiếu

- Component: `client/src/components/sections/MapSection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'map'
