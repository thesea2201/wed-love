# WedLove Design System

> Source of truth cho toàn bộ hệ thống thiết kế.
> **Quy tắc: sửa design trước, code sau.**

Chi tiết đã được tách thành các file riêng trong `docs/design/`. File này là index.

## Cấu trúc

```
docs/design/
├── 00-overview.md              ← Tổng quan + quy trình làm việc
├── 01-data-model.md            ← Invitation data model, section config, types
├── 02-layout-rules.md          ← ⚠️ CRITICAL: Rules chống vỡ layout
├── 03-editor.md                ← Editor architecture, preview sync, API
├── 04-templates.md             ← Template presets + checklist tạo mới
├── 05-accessibility.md         ← A11y requirements + future extensions
│
└── sections/                   ← Spec chi tiết từng section
    ├── hero.md
    ├── story.md
    ├── event.md
    ├── rsvp.md
    ├── gallery.md
    ├── countdown.md
    ├── map.md
    ├── music.md
    └── gift.md
```

## Quick Links

| Tôi muốn... | Đọc file |
|-------------|----------|
| Tạo template mới | `04-templates.md` → checklist cuối file |
| Sửa layout section | `02-layout-rules.md` → đọc trước khi code |
| Hiểu data model | `01-data-model.md` |
| Xem spec 1 section | `sections/<name>.md` |
| Hiểu editor/preview | `03-editor.md` |
| Thêm section mới | Tạo `sections/<name>.md` theo format chuẩn |
