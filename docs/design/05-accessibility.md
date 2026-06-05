# Accessibility

## Requirements

- Form inputs phải có `<label>` liên kết
- Color contrast ratio > 4.5:1
- Keyboard navigation cho tabs (Arrow keys, Tab)
- ARIA labels cho icon-only buttons (lightbox close, music toggle, gift modal close)
- Focus indicators visible
- Touch target tối thiểu `44px` (`min-h-[44px]`)

## Trạng thái hiện tại

⚠️ ARIA usage hiện tại còn thiếu — chỉ có 1 `aria-hidden` trong GiftSection. Cần bổ sung:
- `aria-label` cho icon-only buttons (lightbox close, music play/pause, gift modal close)
- `role` attributes cho interactive elements
- `aria-label` cho dietary option buttons trong RSVP

---

# Roadmap

## Phase 4 Sections (chưa implement)

- **voice:** Voice/video messages từ khách
- **livestream:** Livestream đám cưới
- **custom:** Custom HTML section

## Advanced Features

- Multiple templates per section (Hero v1, Hero v2...)
- Custom CSS injection
- Animation speed controls
- Section entrance effects
