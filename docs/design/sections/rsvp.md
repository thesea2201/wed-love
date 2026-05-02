# RSVP Section

> Form xác nhận tham dự cho khách mời.

## Config

```typescript
{
  showDietary: boolean;        // Hiển thị tùy chọn ăn uống
  dietaryOptions: string[];    // ["Ăn chay", "Dị ứng đậu phộng", "Dị ứng hải sản"]
  maxAttendees: number;        // Số khách tối đa mỗi RSVP (default: 5)
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| token | URL query `?token=xxx` | Cần để gửi RSVP |
| existing RSVP | `guest?.rsvp` | Pre-fill nếu đã phản hồi |
| primaryColor | `invitation.primaryColor` | Cho button/active states |

## Visual Behavior

### Trạng thái chưa gửi

1. **Status selection** — 3 nút: "Sẽ tham dự" / "Có thể" / "Không thể"
   - Active state: `backgroundColor: primaryColor, color: white`
   - Inactive state: `border: #e5e7eb, transparent bg`
2. **Khi chọn "Sẽ tham dự"** → hiện thêm:
   - Số khách (select, 1 → maxAttendees)
   - Yêu cầu ăn uống (nếu `showDietary: true`)
     - Có `dietaryOptions` → hiện buttons dạng chip
     - Không có options → hiện text input
3. **Submit button** — full-width, primaryColor, disabled khi chưa chọn status hoặc không có token
4. **Không có token** → hiện thông báo: *"Vui lòng truy cập qua link cá nhân..."*

### Trạng thái đã gửi

- Hiện message success: *"Cảm ơn bạn! Phản hồi đã được ghi nhận."*
- Background `bg-green-50`, text `text-green-800`

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 1, 2
- **KHÔNG dùng `max-w-*`** trên container
- Buttons: `flex flex-col gap-2` mặc định, `sm:grid sm:grid-cols-3` cho màn hình rộng
- Touch target: `min-h-[44px]` cho mọi interactive elements
- Form elements: `w-full`, padding `px-3 py-2.5`

## API

```
POST /guests/:token/rsvp
Body: { status, attendees, dietary: string[] }
```

Hook: `useGuestRSVP()` (React Query mutation)

## Default Config

```json
{
  "showDietary": true,
  "dietaryOptions": ["Ăn chay", "Dị ứng đậu phộng", "Dị ứng hải sản"],
  "maxAttendees": 5
}
```

## File tham chiếu

- Component: `client/src/components/sections/RSVPSection.tsx`
- Hook: `client/src/hooks/use-guest.ts` → useGuestRSVP
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'rsvp'
