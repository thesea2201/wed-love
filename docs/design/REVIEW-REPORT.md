# Design Docs Review Report

> Date: 2025-05-23 | Scope: Full audit (content, code alignment, completeness)
> Updated: 2025-05-24 | Fixes applied

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| 🔴 Critical | 4 | 4 ✅ |
| 🟠 High | 8 | 8 ✅ |
| 🟡 Medium | 10 | 5 ✅ |
| 🔵 Low | 6 | 2 ✅ |

---

## 🔴 Critical Issues

### C1. Gift section — major spec drift
- **Design**: `gift.md` specifies `methods`, `showBankQR`, `brideQR`, `groomQR`, `brideBankInfo`, `groomBankInfo`
- **Code**: `GiftSection.tsx` + `types/index.ts` uses `brideBankId`, `brideAccountNumber`, `brideAccountName`, `groomBankId`, `groomAccountNumber`, `groomAccountName`, `displayMode`
- **Impact**: Design doc is completely out of date — code has been significantly refactored with VietQR bank integration
- **Files**: `sections/gift.md` ↔ `GiftSection.tsx`, `types/index.ts` (lines 63-76)
- **Fix**: **Update design doc** to match the current code implementation (bank ID / account number / account name model, VietQR integration, `displayMode: 'inline' | 'modal'`)

### C2. Layout Rule 1 violated in 5 section components
- **Rule**: `02-layout-rules.md` says "KHÔNG dùng `max-w-*` trên container chính"
- **Violations**:
  - `StorySection.tsx:12` → `max-w-4xl mx-auto`
  - `EventSection.tsx:52` → `max-w-5xl mx-auto`
  - `GallerySection.tsx:38` → `max-w-5xl mx-auto`
  - `MapSection.tsx:15` → `max-w-4xl mx-auto`
  - `MusicSection.tsx:38` → `max-w-md mx-auto`
  - `RSVPSection.tsx:45` → `max-w-md mx-auto` (submitted state only)
- **Impact**: Layout breaks in editor preview iframe (narrow widths)
- **Fix**: **Update code** — replace `max-w-*` with `w-full mx-auto` and control spacing via `px-*` on section wrapper

### C3. Layout Rule 8 violated — non-responsive container pattern
- **Rule**: All sections should use `py-12 md:py-24 px-3 md:px-4`
- **Violations**:
  - `StorySection.tsx:11` → `py-24 px-4` (no mobile breakpoint)
  - `GallerySection.tsx:37` → `py-24 px-4` (no mobile breakpoint)
  - `MapSection.tsx:14` → `py-24 px-4` (no mobile breakpoint)
  - `MusicSection.tsx:33` → `py-12 px-4` (missing `md:` variant, uses `px-4` not `px-3`)
  - `EventSection.tsx:51` → `py-16 md:py-24 px-4` (uses `py-16` not `py-12`, `px-4` not `px-3`)
  - `HeroSection.tsx:18` → `px-4` (acceptable for hero, but lacks `px-3` for mobile)
- **Impact**: Excessive padding on mobile screens
- **Fix**: **Update code** to use the standard pattern `py-12 md:py-24 px-3 md:px-4`

### C4. `InvitationData` mismatch between design doc and code
- **Design** (`01-data-model.md`): Does not include `id`, `slug`, `status`, `isPublished`, `publishedAt`
- **Code** (`types/index.ts:85-114`): Includes all of those fields
- **Impact**: Developers relying on design doc will miss required fields
- **Fix**: **Update design doc** to include `id`, `slug`, `status`, `isPublished`, `publishedAt`

---

## 🟠 High Issues

### H1. Hero — `parallax` config destructured but never used
- **Design**: `hero.md` specifies parallax background effect
- **Code**: `HeroSection.tsx:5` destructures `parallax` but never uses it in JSX — no parallax behavior implemented
- **Fix**: Either **implement parallax** or **update design doc** to mark as "(Future)"

### H2. Music — floating button behavior not implemented
- **Design**: `music.md` specifies "Floating music button (góc dưới phải)" and `fixed bottom-4 right-4 z-50`
- **Code**: `MusicSection.tsx` renders an inline section, not a floating button
- **Fix**: **Update code** to match floating button spec, or **update design doc** to describe inline behavior

### H3. Music — `fadeIn` config destructured but unused
- **Code**: `MusicSection.tsx:6` destructures `fadeIn` but never applies it
- **Fix**: **Implement fade-in** on audio playback or **remove from config spec**

### H4. Map — `provider` and `showDirections` configs not used
- **Design**: `map.md` specifies `provider: 'google' | 'openstreetmap'` and `showDirections: boolean`
- **Code**: `MapSection.tsx` uses `config.embedUrl` (undocumented) instead; no provider switch, no "Chỉ đường" button
- **Fix**: **Update design doc** to reflect `embedUrl` config; either implement `showDirections` or document its removal

### H5. Event — Vietnamese date format not implemented
- **Design**: `event.md` specifies "Thứ Bảy, ngày 15 tháng 6 năm 2026"
- **Code**: `EventSection.tsx` does not format `invitation.weddingDate` at all — only shows event time
- **Fix**: **Update code** to display formatted Vietnamese date

### H6. Story — `timeline` layout documented but not implemented
- **Design**: `story.md` lists `layout: 'split' | 'full' | 'timeline'`
- **Code**: `StorySection.tsx` only handles `split` and `full`; editor only offers `split` and `full`
- **Fix**: **Update design doc** to mark `timeline` as "(Future)" or **implement it**

### H7. Editor `photos` tab undocumented
- **Design**: `03-editor.md` lists tabs as `content | design | sections`
- **Code**: `types.ts:3` defines `EditorTab = 'content' | 'design' | 'sections' | 'photos'`; `PhotosTab.tsx` exists
- **Fix**: **Update design doc** to include `photos` tab and its responsibilities

### H8. `SectionType` includes Phase 4 types not documented in data model
- **Code**: `types/index.ts:12-14` includes `'voice' | 'livestream' | 'custom'`
- **Design**: `01-data-model.md` only lists 9 types; `05-accessibility.md` mentions them as "Phase 4 (chưa implement)"
- **Fix**: **Update `01-data-model.md`** to include Phase 4 types as commented-out or explicitly Future

---

## 🟡 Medium Issues

### M1. `GuestData` design vs code mismatch
- **Design**: Includes `phone?`, `rsvp.dietary: string[]`, `personalization.customMessage?`, `personalization.sharedPhoto?`
- **Code**: Missing `phone`, `rsvp` lacks `dietary`, field nullability differs (`string | null` vs optional)
- **Fix**: **Align design doc** with code types

### M2. Countdown — `style` config not exposed in editor
- **Design**: `countdown.md` specifies `style: 'simple' | 'boxed' | 'elegant'`
- **Code**: `CountdownSection.tsx` reads `style` but `SectionsTab.tsx` (countdown case) doesn't offer a style selector
- **Fix**: **Add style selector to editor** or document it as non-editable

### M3. Countdown — background color mismatch
- **Design**: `countdown.md` says "Background: `bg-gray-900 text-white`"
- **Code**: `CountdownSection.tsx:58` uses `bg-white` with colored boxes
- **Fix**: **Update design doc** to match the lighter, current implementation

### M4. RSVP — dietary handled as single string, not array
- **Design**: `rsvp.md` says `dietary: string[]` in API body
- **Code**: `RSVPSection.tsx:14` uses `const [dietary, setDietary] = useState('')` — single string, wrapped in array at submit
- **Fix**: **Update code** to support multi-select dietary options, or **update design** to clarify single-selection behavior

### M5. Event — `EventItem.id` field present in code but missing from design doc
- **Design** (`01-data-model.md`): `EventItem` has no `id` field
- **Code** (`types/index.ts:37`): `EventItem` has `id: string`
- **Fix**: **Update design doc** to include `id`

### M6. Event — `dressCode` is optional in design but required in code
- **Design**: `event.md` shows `dressCode?: string`
- **Code**: `types/index.ts:42` has `dressCode: string` (not optional)
- **Fix**: **Make `dressCode` optional in types** or document as required

### M7. Gallery — heading text inconsistency
- **Design**: Title not explicitly specified
- **Code**: `GallerySection.tsx:44` uses "Kho Ảnh"
- **Fix**: Minor — document the section heading text in `gallery.md`

### M8. Map — `embedUrl` config used in code but undocumented
- **Code**: `MapSection.tsx:11` reads `config.embedUrl`
- **Design**: `map.md` only documents `provider` and `showDirections`
- **Fix**: **Update `map.md`** to document `embedUrl` config

### M9. Gift — `displayMode` config undocumented
- **Code**: `GiftSection.tsx:177` and `SectionsTab.tsx:34` support `displayMode: 'inline' | 'modal'`
- **Design**: `gift.md` does not mention display modes
- **Fix**: **Update `gift.md`**

### M10. Templates — incomplete preset definitions
- **Design**: `04-templates.md` defines full section presets for Cinematic but only "differences" for others
- **Code**: `TEMPLATE_OPTIONS` in `types.ts` only stores `id, name, nameVi, preview, primaryColor, fontFamily` — no section presets, no `secondaryColor`, no `accent`
- **Fix**: Either **implement full template presets in code** or **note in docs** that section presets are aspirational

---

## 🔵 Low Issues

### L1. Missing type definitions: `CountdownConfig`, `MapConfig`
- `types/index.ts` defines config interfaces for Hero, Story, Event, RSVP, Gallery, Gift, Music — but not Countdown or Map
- **Fix**: Add `CountdownConfig` and `MapConfig` interfaces

### L2. Accessibility — minimal ARIA usage
- Only 1 `aria-hidden` attribute found across all section components (`GiftSection.tsx:335`)
- `05-accessibility.md` requires ARIA labels for icon-only buttons — not implemented
- No `role` attributes found
- **Fix**: Add ARIA labels to icon-only buttons (lightbox close, music toggle, gift modal close)

### L3. Accessibility — form labels not linked in RSVP
- `RSVPSection.tsx` uses `<label>` elements but dietary chip buttons have no accessible label association
- **Fix**: Add `aria-label` to dietary option buttons

### L4. `05-accessibility.md` mixes accessibility requirements with future features
- "Future Extensions" and "Advanced Features" sections belong in a roadmap doc, not accessibility
- **Fix**: Move Phase 4 and advanced features to a separate `06-roadmap.md`

### L5. Section file format inconsistency
- Most section files follow: Config → Data Dependencies → Visual Behavior → Lưu ý layout → Default Config → File tham chiếu
- `music.md` uses "Lưu ý" instead of "Lưu ý layout" and lacks Data Dependencies table
- `hero.md` uses "Default Config" but no "Editor" section
- **Fix**: Standardize all section files to the same structure

### L6. Cinematic template preset includes `countdown` and `music` sections but docs sections table doesn't
- `04-templates.md` Cinematic preset table shows 7 sections (hero→gift), skipping countdown and music
- **Fix**: Add countdown and music to template preset table, or clarify they are optional

---

## Recommended Priority

1. **C1 + C4**: Update `01-data-model.md` and `gift.md` to match current code — prevents new contributors from using wrong interfaces
2. **C2 + C3**: Fix layout rule violations across 6 section components — prevents visual bugs in editor preview
3. **H1–H4**: Decide for each: implement the feature or update doc to mark as Future
4. **H5–H8**: Smaller doc updates
5. **M1–M10**: Incremental alignment
6. **L1–L6**: Polish pass
