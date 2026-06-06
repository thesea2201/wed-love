# Music Section

> Nhạc nền cho thiệp cưới.

## Config

```typescript
{
  autoplay: boolean;      // Tự phát khi load
  fadeIn: boolean;         // (Future) Hiệu ứng fade in — config có nhưng chưa implement
  showControls: boolean;   // Hiển thị player controls
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| musicUrl | `invitation.musicUrl` | URL file audio |
| musicAutoplay | `invitation.musicAutoplay` | System-level autoplay |
| musicFadeIn | `invitation.musicFadeIn` | System-level fade |

## Visual Behavior

- Inline section (không phải floating button)
- Heading "Nhạc Nền" + play/pause button
- Play/pause toggle (`▶` / `⏸`)
- Autoplay cần user interaction trước (browser policy)
- Ẩn section hoàn toàn nếu không có `musicUrl`

### (Future) Floating mode
- Floating music button ở góc dưới phải (`fixed bottom-4 right-4 z-50`)
- Volume slider khi `showControls: true`
- "Tap to play music" overlay lần đầu

## Lưu ý

- Browser policy: autoplay bị block nếu user chưa interact
- Cần handle `play()` promise rejection
- Container theo Rule 8: `py-12 md:py-24 px-3 md:px-4`

## Default Config

```json
{
  "autoplay": false,
  "fadeIn": true,
  "showControls": true
}
```

## File tham chiếu

- Component: `client/src/components/sections/MusicSection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'music'
