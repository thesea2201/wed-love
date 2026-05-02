# Music Section

> Nhạc nền cho thiệp cưới.

## Config

```typescript
{
  autoplay: boolean;      // Tự phát khi load
  fadeIn: boolean;         // Hiệu ứng fade in
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

- Floating music button (góc dưới phải)
- Play/pause toggle với animation
- Autoplay cần user interaction trước (browser policy)
- Optional: "Tap to play music" overlay lần đầu
- Volume slider khi `showControls: true`

## Lưu ý

- Browser policy: autoplay bị block nếu user chưa interact
- Cần handle `play()` promise rejection
- Floating button: `fixed bottom-4 right-4 z-50`

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
