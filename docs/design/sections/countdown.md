# Countdown Section

> Đếm ngược đến ngày cưới — standalone (khác với countdown trong Hero).

## Config

```typescript
{
  showSeconds: boolean;                    // Hiển thị giây
  showLabels: boolean;                     // Hiển thị nhãn "Ngày", "Giờ"...
  style: 'simple' | 'boxed' | 'elegant';  // Kiểu hiển thị
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| weddingDate | `invitation.weddingDate` | ✅ |
| groomName | `invitation.groomName` | Cho text phụ |
| brideName | `invitation.brideName` | Cho text phụ |
| primaryColor | `invitation.primaryColor` | Cho box styling |

## Visual Behavior

### Đang đếm ngược
- 4 ô: Ngày / Giờ / Phút / [Giây] (tùy `showSeconds`)
- Vietnamese labels: "Ngày", "Giờ", "Phút", "Giây"
- Giá trị zero-padded: "09", "03"
- Update realtime mỗi giây
- Background: `bg-gray-900 text-white`
- Text phụ: *"đến ngày trọng đại của {groomName} & {brideName}"*

### Ngày cưới đã đến
- Thay toàn bộ bằng message: *"Hôm nay là ngày vui!"*
- Background dùng primaryColor
- Text: *"Chúc mừng đám cưới {groomName} & {brideName}"*

### Box styling (khi `style: 'boxed'`)
- Background: `${primaryColor}20` (20% opacity)
- Border: `1px solid ${primaryColor}40` (40% opacity)

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 1, 3
- **KHÔNG dùng `max-w-*`** trên container
- **KHÔNG dùng `grid grid-cols-2`** trực tiếp — sẽ vỡ ở width < 250px
- Dùng `flex flex-wrap justify-center gap-2` cho mobile
- Mỗi ô: `flex-1 min-w-[70px] max-w-[120px]`
- Upgrade lên `md:grid md:grid-cols-4 md:gap-4` cho desktop
- Font size: `text-xl` mobile → `md:text-4xl lg:text-5xl` desktop
- Label size: `text-[10px]` mobile → `md:text-sm` desktop

## Default Config

```json
{
  "showSeconds": true,
  "showLabels": true,
  "style": "boxed"
}
```

## File tham chiếu

- Component: `client/src/components/sections/CountdownSection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'countdown'
