# Editor Architecture

## Layout

Editor chia 2 panel: **Editor (2/5)** | **Preview (3/5)** trên desktop (`lg:grid-cols-5`).

## State Management

```
EditorState {
  original: InvitationData    ← data từ server
  draft: InvitationData       ← đang chỉnh sửa (preview dùng cái này)
  activeTab: 'content' | 'design' | 'sections'
  isSaving / isPublishing / saveError
}
```

- `updateDraft(partial)` → merge vào draft
- `updateSections(sections)` → cập nhật sections array trong draft

## Tab Responsibilities

| Tab | Chức năng | Fields |
|-----|-----------|--------|
| **Content** | Nội dung thiệp | title, subtitle, couple names, date, venue, story |
| **Design** | Giao diện | template, colors, font, cover photo |
| **Sections** | Quản lý sections | toggle, reorder, config từng section |

## Preview Sync

### Cơ chế

1. **Initial load:** iframe `src` với `#draft=<encoded_data>` trong URL hash
2. **Subsequent updates:** `postMessage` (không reload iframe)
3. **Force refresh:** Nút 🔄 trong preview header

```
Editor (PreviewPane)
  ↓ postMessage({ type: 'WEDLOVE_PREVIEW_UPDATE', data: draft })
InvitationView
  ↓ window.addEventListener('message', handler)
  ↓ setLivePreviewData(event.data.data)
  → re-render sections
```

### Device Toggle

Preview hỗ trợ 3 kích thước:

| Mode | Width | Icon |
|------|-------|------|
| Mobile | 375px | 📱 |
| Tablet | 768px | 📟 |
| Desktop | 100% | 🖥️ |

### Priority khi chọn data hiển thị

```
livePreviewData (postMessage) > draftData (URL hash) > API data
```

## Save Flow

```
Save → PATCH /invitations/:id (content fields)
     → PATCH /invitations/:id/sections (sections JSON)
     → setOriginal(draft), setHasChanges(false)
```

## Publish Flow

```
Publish → auto-save nếu có changes
        → POST /invitations/:id/publish
        → setIsPublished(true)
```

## API Endpoints

| Method | Path | Mục đích |
|--------|------|----------|
| GET | `/invitations/id/:id` | Lấy invitation data |
| PATCH | `/invitations/:id` | Cập nhật content fields |
| PATCH | `/invitations/:id/sections` | Cập nhật sections JSON |
| POST | `/invitations/:id/publish` | Xuất bản |
| POST | `/ai/generate-story` | AI tạo love story |
