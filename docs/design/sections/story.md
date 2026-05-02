# Story Section

> Câu chuyện tình yêu của cặp đôi, kèm ảnh.

## Config

```typescript
{
  layout: 'split' | 'full' | 'timeline';
  imagePosition: 'left' | 'right' | 'top';
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| story | `invitation.story` | Có fallback placeholder |
| photo | `invitation.gallery[0]` | Ảnh đầu tiên trong gallery |

## Visual Behavior

- **Split layout:** 2 cột (ảnh | text) hoặc (text | ảnh) tùy `imagePosition`
- **Full layout:** 1 cột, centered
- **Timeline layout:** (Future) Vertical timeline với milestones
- Text render paragraphs qua `\n`
- Fallback placeholder nếu story trống: *"Câu chuyện tình yêu của chúng tôi..."*

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 8 cho container chuẩn
- Split layout trên mobile tự chuyển thành 1 cột (stack ảnh trên, text dưới)
- Không dùng `max-w-*` trên container

## AI Story Generation

- Tích hợp qua ContentTab → nút "AI viết story"
- API: `POST /ai/generate-story`
- Input: style, couple names, how they met
- Output: text story, replace vào `invitation.story`

## Default Config

```json
{
  "layout": "split",
  "imagePosition": "left"
}
```

## File tham chiếu

- Component: `client/src/components/sections/StorySection.tsx`
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'story'
