# Gift Section

> Mừng cưới điện tử — hỗ trợ tách nhà gái / nhà trai, tích hợp VietQR.

## Config

```typescript
{
  customMessage: string;         // Lời nhắn tùy chỉnh
  showBrideSide: boolean;        // Hiển thị nhà gái
  showGroomSide: boolean;        // Hiển thị nhà trai
  brideBankId: string;           // Mã ngân hàng nhà gái (VietQR bank ID)
  brideAccountNumber: string;    // Số tài khoản nhà gái
  brideAccountName: string;      // Tên chủ tài khoản nhà gái
  groomBankId: string;           // Mã ngân hàng nhà trai (VietQR bank ID)
  groomAccountNumber: string;    // Số tài khoản nhà trai
  groomAccountName: string;      // Tên chủ tài khoản nhà trai
  displayMode: 'inline' | 'modal'; // inline = section, modal = floating button + bottom sheet
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| groomName | `invitation.groomName` | Cho tab label |
| brideName | `invitation.brideName` | Cho tab label |
| primaryColor | `invitation.primaryColor` | Cho tab/card styling |
| secondaryColor | `invitation.secondaryColor` | Cho tab background |

## VietQR Integration

- Bank list: `VIETQR_BANKS` array (30+ ngân hàng VN) — export từ `GiftSection.tsx`
- QR URL tự sinh: `https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact.png`
- Mỗi bank card có: logo ngân hàng, tên chủ TK, số TK (copy), mã QR (download)

## Visual Behavior

### Display Mode: Inline (default)
- Render như section bình thường trong page flow
- Container theo Rule 8: `py-12 md:py-24 px-3 md:px-4`

### Display Mode: Modal
- Floating gift button (🎁) ở góc dưới phải (`fixed bottom-6 right-6 z-40`)
- Click → Bottom sheet modal (mobile) / centered modal (desktop)
- Drag-to-dismiss trên mobile
- Compact layout bên trong modal

### Tabs (khi cả 2 side đều bật)
- 2 tab: "Nhà gái" / "Nhà trai"
- Active: `backgroundColor: primaryColor, color: white`
- Inactive: transparent
- Tab bar background: secondaryColor
- **Label ngắn gọn** — chỉ "Nhà gái" / "Nhà trai", không kèm tên dài

### Nội dung mỗi side (BankCard component)
- Header: emoji (👰/🤵) + "Nhà gái/trai - {name}"
- Bank logo + tên chủ TK + tên ngân hàng
- Số tài khoản với nút "Sao chép" (clipboard API)
- Mã QR VietQR tự sinh (có nút "Tải QR về")
- Card background: `${primaryColor}10` (10% opacity)

### Khi chỉ 1 side
- Không hiện tabs, hiện trực tiếp nội dung

### Khi không có thông tin ngân hàng
- Hiện: *"Thông tin ngân hàng chưa được cập nhật."*

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 1, 4, 5, 6
- **KHÔNG dùng `max-w-*`** trên container
- Tab buttons: `text-xs md:text-sm`, `px-2 md:px-4`, class `truncate`
- QR images: `w-32 h-32` (compact) / `w-40 h-40` (normal)
- Account number: `font-mono` cho số tài khoản
- Card padding: `p-3 md:p-6`
- Container: `overflow-hidden` trên card wrapper
- Header tên: class `truncate` (tên dài sẽ bị cắt)

## Editor

- Select "Kiểu hiển thị": inline / modal
- Checkboxes toggle "Hiện nhà gái" / "Hiện nhà trai"
- Mỗi bên: dropdown chọn ngân hàng (từ VIETQR_BANKS), input số TK, input tên chủ TK
- Textarea cho lời nhắn tùy chỉnh

## Default Config

```json
{
  "customMessage": "",
  "showBrideSide": true,
  "showGroomSide": true,
  "brideBankId": "",
  "brideAccountNumber": "",
  "brideAccountName": "",
  "groomBankId": "",
  "groomAccountNumber": "",
  "groomAccountName": "",
  "displayMode": "inline"
}
```

## File tham chiếu

- Component: `client/src/components/sections/GiftSection.tsx`
- Types: `client/src/types/index.ts` → GiftConfig
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'gift'
