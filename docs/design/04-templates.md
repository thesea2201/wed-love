# Template Presets

Templates định nghĩa bộ default config + styling cho invitation. Người dùng chọn template rồi có thể customize thêm.

## Khi tạo template mới

1. Đọc `02-layout-rules.md` — tuân thủ mọi rule
2. Đọc từng file trong `sections/` — đảm bảo section config đúng interface
3. Định nghĩa: color palette, typography, sections order, section-specific config
4. Không cần code mới — template chỉ là **preset config**, component section tái sử dụng

## Template: Cinematic (Default)

**Style:** Dramatic, romantic, full-screen hero với parallax

**Colors:**
| Token | Giá trị | Mô tả |
|-------|---------|-------|
| primaryColor | `#c8956c` | Warm gold |
| secondaryColor | `#f5f0eb` | Cream |

**Font:** Playfair Display (serif)

**Sections preset:**

| Order | Type | Config highlights |
|-------|------|-------------------|
| 0 | hero | showCountdown: true, parallax: true, greetingStyle: "formal" |
| 1 | story | layout: "split", imagePosition: "left" |
| 2 | event | showDressCode: true |
| 3 | gallery | columns: 3, lightbox: true |
| 4 | rsvp | showDietary: true, maxAttendees: 5 |
| 5 | map | provider: "google", showDirections: true |
| 6 | gift | methods: ["momo", "bank_transfer"], showBankQR: true |

---

## Template: Elegant

**Style:** Classic, sophisticated, gold accents với floral elements

**Colors:**
| Token | Giá trị | Mô tả |
|-------|---------|-------|
| primaryColor | `#c9a96e` | Antique gold |
| secondaryColor | `#fffef8` | Ivory |
| accent | `#2c3e50` | Navy |

**Font:** Cormorant Garamond (elegant serif)

**Khác biệt so với Cinematic:**
- Hero: Không parallax, viền hoa trang trí
- Story: Full-width ảnh phía trên text
- Dividers trang trí giữa các section

---

## Template: Modern

**Style:** Clean, minimal, bold sans-serif

**Colors:**
| Token | Giá trị | Mô tả |
|-------|---------|-------|
| primaryColor | `#1a1a1a` | Near black |
| secondaryColor | `#ffffff` | White |
| accent | `#ff6b6b` | Coral |

**Font:** Inter (modern sans-serif)

**Khác biệt:**
- Hero: Simple, không overlay, clean typography
- Gallery: 4 columns
- RSVP: Inline form

---

## Template: Minimal

**Style:** Ultra-clean, tối đa whitespace

**Colors:**
| Token | Giá trị | Mô tả |
|-------|---------|-------|
| primaryColor | `#000000` | Black |
| secondaryColor | `#ffffff` | White |

**Font:** Inter thin weights (300, 400)

**Khác biệt:**
- Ít section hiện mặc định (hero, event, rsvp)
- Không background images
- Animation tối giản

---

## Template: Vintage

**Style:** Retro, sepia tones, cảm giác giấy cũ

**Colors:**
| Token | Giá trị | Mô tả |
|-------|---------|-------|
| primaryColor | `#8b7355` | Sepia |
| secondaryColor | `#f4e4bc` | Aged paper |
| accent | `#5c4033` | Dark brown |

**Font:** Great Vibes (script/handwriting)

**Khác biệt:**
- Hero: Paper texture overlay, sepia filter
- Story: Timeline layout (nếu có)
- Photos: Sepia filter nhẹ

---

## Thêm template mới — Checklist

- [ ] Chọn color palette (primary, secondary, optional accent)
- [ ] Chọn font family (phải load từ Google Fonts trong `index.css`)
- [ ] Định nghĩa sections preset (order, visible, config)
- [ ] Thêm vào `TEMPLATE_OPTIONS` trong `client/src/components/invitation-editor/types.ts`
- [ ] Test trên cả 3 device sizes (mobile 375px, tablet 768px, desktop)
- [ ] Tuân thủ mọi rule trong `02-layout-rules.md`
