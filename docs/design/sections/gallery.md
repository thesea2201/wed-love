# Gallery Section

> Bộ ảnh cưới / ảnh cặp đôi.

## Config

```typescript
{
  columns: 2 | 3 | 4;         // Số cột grid
  lightbox: boolean;           // Click để phóng to
  allowGuestUpload: boolean;   // (Future) Khách upload ảnh
  images?: string[];           // Subset ảnh hiển thị, chọn từ Media Library
                               // Rỗng/undefined = hiện toàn bộ media pool
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| images | `config.images` (uu tiên) hoặc `invitation.gallery` (toàn bộ pool) | Từ Media Library |

## Visual Behavior

- Grid responsive: `columns` trên desktop, tự giảm cột trên mobile
- Hover: slight scale up
- Lightbox modal khi `lightbox: true` — swipe navigation
- Empty state khi không có ảnh
- Fallback: mock Unsplash images (⚠️ một số link có thể broken)

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 8 cho container
- Grid tự responsive: `grid-cols-2 md:grid-cols-{columns}`
- Ảnh dùng `object-cover` và `aspect-square` hoặc `aspect-[3/4]`
- Lazy loading: `loading="lazy"` trên `<img>`

## Default Config

```json
{
  "columns": 3,
  "lightbox": true,
  "allowGuestUpload": false,
  "images": []
}
```

## File tham chiếu

- Component: `client/src/components/sections/GallerySection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'gallery'
