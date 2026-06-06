# Hero Section

> Ấn tượng đầu tiên — tên cặp đôi, ngày cưới, countdown tùy chọn.

## Config

```typescript
{
  showCountdown: boolean;              // Hiển thị countdown timer
  parallax: boolean;                   // (Future) Hiệu ứng parallax background — config có nhưng chưa implement
  greetingStyle: 'formal' | 'casual'; // Phong cách chào khách
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| groomName | `invitation.groomName` | ✅ |
| brideName | `invitation.brideName` | ✅ |
| weddingDate | `invitation.weddingDate` | ✅ |
| coverPhoto | `invitation.coverPhoto` | Chọn từ Media Library. Fallback Unsplash |
| subtitle | `invitation.subtitle` | Hiển thị nếu có |
| guest name | `guest?.name` | Cho lời chào cá nhân |

## Visual Behavior

- Full viewport height (`min-h-screen`)
- Centered text, display typography lớn
- Tên chú rể — `&` — Tên cô dâu (ký tự `&` dùng primaryColor)
- Subtitle hiển thị bên dưới tên nếu có
- Countdown ngày còn lại (nếu `showCountdown: true`)
- "Save the Date" text: `"{X} ngày nữa"`
- Scroll indicator ở bottom (chevron animated)
- Parallax background khi `parallax: true`
- Greeting cá nhân hóa theo `guest?.name`

## Lưu ý layout

- Xem `02-layout-rules.md` — áp dụng Rule 8 cho container
- Cover photo dùng `bg-cover bg-center` với dark overlay
- Font chữ tên: `font-display` (Playfair Display)
- primaryColor áp dụng cho ký tự `&` giữa 2 tên

## Default Config

```json
{
  "showCountdown": true,
  "parallax": true,
  "greetingStyle": "formal"
}
```

## File tham chiếu

- Component: `client/src/components/sections/HeroSection.tsx`
- Editor config: Không có riêng (Hero luôn visible)
