# WedLove Design System — Overview

> Source of truth cho toàn bộ hệ thống thiết kế. Khi tạo template mới hoặc sửa section, **đọc file tương ứng trước, sửa design trước khi code.**

## Kiến trúc

WedLove dùng **section-based composable architecture** — mỗi thiệp cưới được ghép từ các section module hóa, có thể bật/tắt, sắp xếp lại, và cấu hình riêng.

## Cấu trúc Design Docs

```
docs/design/
├── 00-overview.md          ← File này
├── 01-data-model.md        ← Invitation data model & section config
├── 02-layout-rules.md      ← ⚠️ CRITICAL: Responsive layout rules
├── 03-editor.md            ← Editor architecture & preview sync
├── 04-templates.md         ← Template presets & color palettes
│
├── sections/
│   ├── hero.md             ← Hero section spec
│   ├── story.md            ← Story section spec
│   ├── event.md            ← Event section spec
│   ├── rsvp.md             ← RSVP section spec
│   ├── gallery.md          ← Gallery section spec
│   ├── countdown.md        ← Countdown section spec
│   ├── map.md              ← Map section spec
│   ├── music.md            ← Music section spec
│   └── gift.md             ← Gift section spec
│
├── 05-accessibility.md     ← A11y requirements + Roadmap
├── 06-media-library.md     ← Media Library (WordPress-style central media pool)
└── REVIEW-REPORT.md        ← Audit report (auto-generated)
```

## Quy trình làm việc

1. **Tạo template mới** → Đọc `04-templates.md` + từng section file trong `sections/`
2. **Sửa layout section** → Đọc `02-layout-rules.md` trước, sửa spec trong `sections/*.md`, rồi code
3. **Thêm section mới** → Tạo file `sections/<name>.md` theo format chuẩn
4. **Thay đổi data model** → Cập nhật `01-data-model.md` trước
5. **Thêm ảnh cho section** → Dùng Media Library picker, đọc `06-media-library.md`

## Nguyên tắc

- **Design docs là source of truth** — code phải match với spec
- **Sửa design trước, code sau** — không code trước rồi docs chạy theo
- **Mỗi section là 1 file** — dễ review, dễ tìm, dễ maintain
