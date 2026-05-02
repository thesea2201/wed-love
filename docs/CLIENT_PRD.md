# WedLove - Product Requirements Document

> **Nền tảng thiệp cưới online cao cấp**  
> *Tài liệu cho khách hàng & stakeholders*  
> Phiên bản: 1.1 | Ngày: 01/05/2026

---

## 1. Tổng Quan Sản Phẩm

WedLove là nền tảng thiệp cưới kỹ thuật số toàn diện, cho phép các cặp đôi:
- **Tạo thiệp cưới online** với nhiều template đẹp mắt
- **Quản lý khách mời** thông minh (import Excel, theo dõi RSVP)
- **Tương tác với khách** (livestream, gửi lời chúc, nhận mừng cưới)
- **Trải nghiệm cá nhân hóa** cho từng vị khách

### Điểm Nổi Bật
- **5 template thiết kế**: Cinematic, Elegant, Modern, Minimal, Vintage
- **Cá nhân hóa từng khách**: Mỗi khách có link riêng, lời chào riêng
- **QR Code thông minh**: Khách quét QR để vào thiệp cá nhân
- **Livestream tích hợp**: Khách xem đám cưới trực tiếp trên thiệp
- **AI hỗ trợ**: Tự động gợi ý nội dung, viết lời mời, phân tích ảnh

---

## 2. Tiến Độ Phát Triển

| Giai Đoạn | Mô Tả | Trạng Thái |
|-----------|-------|------------|
| **Phase 1: Nền Tảng** | Auth, thiệp cưới cơ bản, quản lý khách | ✅ Hoàn thành |
| **Phase 2: Cá Nhân Hóa** | Import Excel, QR Code, template mới | 🔄 Sắp tới |
| **Phase 3: AI** | AI viết lời, phân tích ảnh, gợi ý template | 📋 Kế hoạch |
| **Phase 4: Tương Tác** | Livestream, gửi lời chúc, nhận tiền mừng | 📋 Kế hoạch |

### Phase 1 - Đã Hoàn Thành ✅

- [x] Hệ thống đăng ký/đăng nhập bảo mật (JWT)
- [x] Tạo và chỉnh sửa thiệp cưới với 5 template
- [x] Upload ảnh bìa và ảnh thư viện
- [x] Quản lý khách mời (thêm, sửa, xóa, phân loại)
- [x] Khách RSVP trực tiếp trên thiệp
- [x] Dashboard analytics (số khách tham dự, tỷ lệ RSVP)
- [x] Giao diện responsive (mobile & desktop)

### Phase 2 - Sắp Triển Khai 🔄

- [ ] Import khách từ file Excel/CSV
- [ ] Tạo QR Code riêng cho từng khách
- [ ] Template Elegant, Modern, Minimal, Vintage
- [ ] Nhạc nền trên thiệp cưới
- [ ] Gallery ảnh với lightbox
- [ ] Countdown timer đến ngày cưới

### Phase 3-4 - AI & Tương Tác 📋

- [ ] AI gợi ý nội dung thiệp cưới
- [ ] AI phân tích và sắp xếp ảnh
- [ ] Livestream đám cưới trực tiếp
- [ ] Gửi lời chúc qua voice/video
- [ ] Nhận tiền mừng (Stripe, MoMo, ZaloPay)
- [ ] Tự động gửi thư cảm ơn sau đám cưới

---

## 3. Demo Truy Cập

### Live Demo
- **URL**: https://wedlove-demo.netlify.app
- **Thiệp mẫu**: `/invitation/an-va-linh-demo`

### Tài Khoản Demo
| Role | Email | Mật khẩu |
|------|-------|----------|
| Quản trị | `demo@wedlove.pro` | `123456` |

### Luồng Demo Gợi Ý
1. **Dashboard**: Đăng nhập → xem quản lý thiệp & khách mời
2. **Thiệp cưới**: Truy cập `/invitation/an-va-linh-demo` → xem giao diện khách
3. **RSVP**: Thử chức năng xác nhận tham dự

---

## 4. Tài Liệu Kỹ Thuật Chi Tiết

| Tài Liệu | Nội Dung | Link |
|----------|----------|------|
| Architecture & Schema | Kiến trúc hệ thống, database design | [01-architecture-and-schema.md](plan/01-architecture-and-schema.md) |
| API Design | REST API endpoints, request/response | [02-api-design.md](plan/02-api-design.md) |
| Feature Details | Implementation chi tiết từng tính năng | [03-features.md](plan/03-features.md) |
| Real-time & Security | Socket.io, JWT, rate limiting | [04-realtime-security-performance.md](plan/04-realtime-security-performance.md) |
| Roadmap & Infra | Timeline, Docker, env variables | [05-roadmap-and-infra.md](plan/05-roadmap-and-infra.md) |
| Testing & Monitoring | Test strategy, logging, metrics | [06-testing-monitoring.md](plan/06-testing-monitoring.md) |

---

## 5. Thông Tin Liên Hệ

**Development Team**: [Your team contact]
**Project**: WedLove Wedding Platform
**Repository**: Private

---

*Document được tạo tự động từ codebase.*
