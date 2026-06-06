# Media Library (Thư viện Media)

> Hệ thống quản lý ảnh tập trung theo mô hình WordPress — upload 1 lần, dùng cho mọi section.

## Khái niệm

WedLove sử dụng **centralized media pool** thay vì upload ảnh riêng lẻ cho từng section:

1. **Media Pool** (`gallery: string[]` trong InvitationData) = kho ảnh trung tâm
2. **Media Library Tab** (Photos tab trong editor) = nơi quản lý kho ảnh
3. **Media Picker** (`MediaLibraryModal`) = component dùng chung để chọn ảnh từ kho

```
┌─────────────────────────────────────────────┐
│              MEDIA POOL (gallery)            │
│  [img1] [img2] [img3] [img4] [img5] [img6] │
└──────┬──────────┬──────────┬────────────────┘
       │          │          │
   ┌───▼───┐  ┌──▼───┐  ┌──▼──────┐
   │ Hero  │  │Story │  │ Gallery │
   │cover  │  │image │  │ images  │
   │Photo  │  │Url   │  │ []      │
   └───────┘  └──────┘  └─────────┘
```

## Data Model

### Media Pool

```typescript
// InvitationData.gallery = media pool
gallery: string[];  // Mảng URL ảnh đã upload — source of truth cho tất cả media
```

Mọi ảnh upload từ bất kỳ đâu (PhotosTab, DesignTab cover photo, section picker) đều được thêm vào `gallery`.

### Section Image References

Mỗi section cần ảnh sẽ lưu URL trong `config` — tham chiếu đến ảnh trong media pool:

| Section | Config field | Kiểu | Mô tả |
|---------|-------------|------|-------|
| Hero | `invitation.coverPhoto` | `string \| null` | Ảnh bìa (top-level field) |
| Story | `config.imageUrl` | `string \| undefined` | Ảnh minh họa câu chuyện |
| Gallery | `config.images` | `string[] \| undefined` | Ảnh hiển thị (subset). Nếu rỗng → hiện toàn bộ pool |

### Fallback Chain

Mỗi section có fallback khi chưa chọn ảnh:

```
Hero:    invitation.coverPhoto → Unsplash placeholder
Story:   config.imageUrl → invitation.gallery[0] → Unsplash placeholder
Gallery: config.images (nếu có) → invitation.gallery (toàn bộ pool) → Unsplash placeholders
```

## Upload Flow

### Upload API

```
POST /upload/file    → 1 file  → { key, publicUrl, thumbnailUrl, size }
POST /upload/files   → n files → { results: UploadResult[] }
```

### Constraints

- **Max size:** 2MB mỗi ảnh
- **Format:** `image/*` (jpg, png, webp, gif)
- **Processing:** Server tạo 2 bản: `full.webp` + `thumb.webp`
- **Storage:** Local disk (`server/uploads/`) hoặc S3 (future)

### Upload → Pool Flow

```
User upload ảnh (từ bất kỳ đâu)
  → POST /upload/file(s)
  → Nhận publicUrl
  → Thêm vào gallery[] (media pool)
  → Section config tham chiếu URL này
```

## Photos Tab (Media Library Manager)

### Chức năng

| Feature | Mô tả |
|---------|-------|
| **Upload zone** | Dropzone kéo thả + nút chọn file, batch upload với progress |
| **Grid view** | Hiển thị tất cả ảnh trong pool, sortable (drag reorder) |
| **Usage indicator** | Badge nhỏ trên mỗi ảnh cho biết đang dùng ở section nào |
| **Delete** | Xóa ảnh khỏi pool, cảnh báo nếu đang được section nào dùng |
| **Bulk actions** | Xóa tất cả (với confirmation) |

### Usage Indicator

Mỗi ảnh trong grid hiển thị badge cho biết nơi đang sử dụng:

```
┌──────────┐
│          │
│   img    │  ← hover hiện overlay
│          │
│ 🏠 📖   │  ← badges: Hero, Story
└──────────┘
```

Icon mapping:
- 🏠 = Hero (coverPhoto)
- 📖 = Story (imageUrl)
- 🖼️ = Gallery (images)

### Delete Warning

Khi xóa ảnh đang được sử dụng:

> "Ảnh này đang được sử dụng ở: Hero, Story. Xóa sẽ bỏ ảnh khỏi các section đó. Tiếp tục?"

## Media Picker Modal (MediaLibraryModal)

### Mục đích

Component dùng chung để chọn ảnh từ media pool. Xuất hiện khi:
- DesignTab → chọn ảnh bìa (cover photo)
- SectionsTab → Story → chọn ảnh minh họa
- SectionsTab → Gallery → chọn ảnh hiển thị (multi-select)

### Props

```typescript
interface MediaLibraryModalProps {
  gallery: string[];              // Media pool hiện tại
  onSelect: (url: string) => void;        // Single select
  onSelectMultiple?: (urls: string[]) => void; // Multi select (cho gallery)
  onClose: () => void;
  onUploadComplete?: (newUrls: string[]) => void; // Callback khi upload xong → thêm vào pool
  multiple?: boolean;             // Cho phép chọn nhiều
  selectedUrls?: string[];        // Ảnh đã chọn (cho multi-select)
}
```

### Tabs

1. **Tải ảnh mới** — Dropzone upload, ảnh mới tự thêm vào pool
2. **Thư viện** — Grid chọn từ pool hiện có

### Behavior khi upload từ Modal

```
Upload trong modal
  → Upload hoàn tất → nhận URL
  → Gọi onUploadComplete([url]) → parent thêm vào gallery (pool)
  → Tự chọn ảnh vừa upload (hoặc user click "Chọn")
```

## Tích hợp với Editor

### Tab Responsibilities (cập nhật)

| Tab | Chức năng | Fields |
|-----|-----------|--------|
| **Content** | Nội dung thiệp | title, subtitle, couple names, date, venue, story |
| **Design** | Giao diện | template, colors, font, cover photo (picker từ media) |
| **Sections** | Quản lý sections | toggle, reorder, config từng section (có image picker) |
| **Photos** | **Media Library** | Upload, quản lý, sắp xếp kho ảnh trung tâm |

### Data Flow

```
PhotosTab (upload/manage)
  → updateDraft({ gallery: [...] })

DesignTab → ImageUpload → MediaLibraryModal
  → Chọn/upload → updateDraft({ coverPhoto: url })
  → Nếu upload mới → cũng thêm vào gallery

SectionsTab → Story config → MediaLibraryModal
  → Chọn → updateSectionConfig({ imageUrl: url })

SectionsTab → Gallery config → MediaLibraryModal (multi)
  → Chọn → updateSectionConfig({ images: [...urls] })
```

## File tham chiếu

| Component | Path |
|-----------|------|
| PhotosTab (Media Manager) | `client/src/components/invitation-editor/PhotosTab.tsx` |
| MediaLibraryModal (Picker) | `client/src/components/MediaLibraryModal.tsx` |
| ImageUpload (Single upload + picker) | `client/src/components/ImageUpload.tsx` |
| Upload utils | `client/src/utils/upload.ts` |
| InvitationEditor (parent) | `client/src/components/InvitationEditor.tsx` |
