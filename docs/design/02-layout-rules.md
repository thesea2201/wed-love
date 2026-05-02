# Layout Rules (CRITICAL)

> ⚠️ **Đọc file này trước khi code bất kỳ section nào.** Các lỗi layout đã xảy ra đều do vi phạm những rules bên dưới.

## Rendering Contexts

Mỗi section render trong **2 ngữ cảnh**:

| Context | Width | Khi nào |
|---------|-------|---------|
| Full-page view | 320px – 1440px+ | Khách mở thiệp trên điện thoại/desktop |
| Editor preview iframe | ~300px – 100% | Người tạo thiệp xem preview trong editor |

→ Section phải hoạt động tốt ở **mọi chiều rộng**, kể cả dưới 320px.

## Rule 1: KHÔNG dùng `max-w-*` trên container chính của section

### ❌ SAI

```tsx
<section className="py-16 px-4 bg-white">
  <div className="max-w-lg mx-auto">  {/* ← VỠ LAYOUT */}
    ...
  </div>
</section>
```

**Tại sao lỗi:**
- `max-w-lg` = 512px cố định
- Khi container parent < 512px → nội dung **không co lại** theo
- Gây tràn, chồng chéo, cắt text

### ✅ ĐÚNG

```tsx
<section className="py-12 md:py-24 px-3 md:px-4 bg-white">
  <div className="w-full mx-auto">
    ...
  </div>
</section>
```

**Nguyên tắc:** Để `px-*` trên `<section>` kiểm soát spacing, `w-full` cho container bên trong.

## Rule 2: Button groups — stack dọc trước, grid sau

### ❌ SAI

```tsx
<div className="grid grid-cols-3 gap-3">
  <button>Option 1</button>
  <button>Option 2</button>
  <button>Option 3</button>
</div>
```

### ✅ ĐÚNG

```tsx
<div className="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-3">
  <button className="w-full min-h-[44px]">Option 1</button>
  ...
</div>
```

## Rule 3: Countdown/grid items — flex-wrap, không grid cố định

### ❌ SAI

```tsx
<div className="grid grid-cols-2 gap-3">
```

### ✅ ĐÚNG

```tsx
<div className="flex flex-wrap justify-center gap-2 md:grid md:grid-cols-4 md:gap-4">
  <div className="flex-1 min-w-[70px] max-w-[120px]">
```

## Rule 4: Tab labels — ngắn gọn, truncate

- ✅ `"Nhà gái"` / `"Nhà trai"`
- ❌ `"Nhà gái (Nguyễn Thị Linh)"` → tràn trên mobile
- Luôn thêm class `truncate` vào tab button

## Rule 5: Responsive sizing

| Element | Mobile | Desktop |
|---------|--------|---------|
| Section padding | `px-3` | `md:px-4` |
| Section vertical | `py-12` | `md:py-24` |
| Headings | `text-2xl` | `md:text-4xl` |
| Body text | `text-xs` hoặc `text-sm` | `md:text-base` |
| Buttons | `py-2.5 px-3 text-sm` | `md:py-3 md:px-4 md:text-base` |
| QR codes | `w-28 h-28` | `md:w-40 md:h-40` |
| Min touch target | `min-h-[44px]` | — |

## Rule 6: Long text handling

- Bank info, URLs: `break-all`
- Tên người: `truncate`
- Nội dung dài: `break-words` hoặc `overflow-hidden`

## Rule 7: Dynamic colors

Section lấy color từ invitation data, **không hardcode**:

```tsx
const primaryColor = invitation.primaryColor || '#c8956c';

// Dùng inline style cho dynamic colors
<button style={{ backgroundColor: primaryColor }}>
```

Không dùng Tailwind class cho dynamic color (ví dụ `bg-[${color}]` không hoạt động ở runtime).

## Rule 8: Section container pattern chuẩn

Mọi section phải theo pattern này:

```tsx
<section className="py-12 md:py-24 px-3 md:px-4 bg-{background}">
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="w-full mx-auto"
  >
    <h2 className="font-display text-2xl md:text-4xl text-center mb-6 md:mb-8">
      {title}
    </h2>
    {/* content */}
  </motion.div>
</section>
```
