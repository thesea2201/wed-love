# Gift Section

> Mừng cưới điện tử — hỗ trợ tách nhà gái / nhà trai.

## Config

```typescript
{
  methods: ('momo' | 'zalopay' | 'bank_transfer' | 'stripe')[];
  showBankQR: boolean;       // Hiển thị mã QR
  customMessage: string;     // Message tùy chỉnh
  showBrideSide: boolean;    // Hiển thị nhà gái
  showGroomSide: boolean;    // Hiển thị nhà trai
  brideQR: string;           // URL ảnh QR nhà gái
  groomQR: string;           // URL ảnh QR nhà trai
  brideBankInfo: string;     // Thông tin chuyển khoản nhà gái
  groomBankInfo: string;     // Thông tin chuyển khoản nhà trai
}
```

## Data Dependencies

| Field | Nguồn | Bắt buộc |
|-------|-------|----------|
| groomName | `invitation.groomName` | Cho tab label |
| brideName | `invitation.brideName` | Cho tab label |
| primaryColor | `invitation.primaryColor` | Cho tab/card styling |
| secondaryColor | `invitation.secondaryColor` | Cho tab background |

## Visual Behavior

### Tabs (khi cả 2 side đều bật)
- 2 tab: "Nhà gái" / "Nhà trai"
- Active: `backgroundColor: primaryColor, color: white`
- Inactive: transparent
- Tab bar background: secondaryColor
- **Label ngắn gọn** — chỉ "Nhà gái" / "Nhà trai", không kèm tên dài

### Nội dung mỗi side
- Header: emoji (👰/🤵) + "Nhà gái/trai - {name}"
- Bank transfer info (nếu method includes 'bank_transfer'):
  - Bank info text (nếu có)
  - QR code image (nếu có)
- MoMo section (nếu method includes 'momo')
- Card background: `${primaryColor}10` (10% opacity)

### Khi chỉ 1 side
- Không hiện tabs, hiện trực tiếp nội dung

### Khi cả 2 side tắt
- Hiện: *"Thông tin mừng cưới chưa được cập nhật."*

## Lưu ý layout

- Xem `02-layout-rules.md` — Rule 1, 4, 5, 6
- **KHÔNG dùng `max-w-*`** trên container
- Tab buttons: `text-xs md:text-sm`, `px-2 md:px-4`, class `truncate`
- QR images: `w-28 h-28 md:w-40 md:h-40`
- Bank info text: class `break-all` (số tài khoản dài)
- Card padding: `p-3 md:p-6`
- Container: `overflow-hidden` trên card wrapper
- Header tên: class `truncate` (tên dài sẽ bị cắt)

## Editor

- Checkboxes toggle "Hiện nhà gái" / "Hiện nhà trai"
- Text input cho bank info, QR URL mỗi bên
- Payment methods checkboxes

## Default Config

```json
{
  "methods": ["momo", "bank_transfer"],
  "showBankQR": true,
  "customMessage": "",
  "showBrideSide": true,
  "showGroomSide": true,
  "brideQR": "",
  "groomQR": "",
  "brideBankInfo": "",
  "groomBankInfo": ""
}
```

## File tham chiếu

- Component: `client/src/components/sections/GiftSection.tsx`
- Types: `client/src/types/index.ts` → GiftConfig
- Editor config: `SectionsTab.tsx` → SectionConfigEditor case 'gift'
