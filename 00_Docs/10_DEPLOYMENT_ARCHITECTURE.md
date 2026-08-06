# KIẾN TRÚC TRIỂN KHAI HẠ TẦNG (DEPLOYMENT ARCHITECTURE SPECIFICATION)
## DỰ ÁN: KIENPRO LMS

---

## 1. TỔNG QUAN MÔ HÌNH HẠ TẦNG (INFRASTRUCTURE OVERVIEW)

Hệ thống **KIENPRO LMS** được thiết kế theo kiến trúc **Serverless & Managed Cloud Services** nhằm tối ưu hóa chi phí vận hành, khả năng tự động mở rộng (Auto-scaling) và tốc độ truy cập cao nhất tại Việt Nam.

```
                  ┌────────────────────────────────────────┐
                  │           HỌC VIÊN / CLIENT            │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │       VERCEL EDGE NETWORK (CDN)        │
                  │        - Next.js 14+ App Router       │
                  │        - Server Components & Actions   │
                  └───────┬───────────────┬───────────┬────┘
                          │               │           │
           ┌──────────────┘               │           └──────────────┐
           ▼                              ▼                          ▼
┌────────────────────┐         ┌────────────────────┐      ┌────────────────────┐
│    SUPABASE CLOUD  │         │ BUNNY STREAM / CF  │      │ RESEND EMAIL API   │
│ - PostgreSQL DB    │         │ - Encrypted HLS    │      │ - Activation Email │
│ - Supabase Auth    │         │ - Transcoding      │      │ - Transactional    │
│ - Storage (PDF)    │         │ - Global Video CDN│      │   Emails           │
└────────────────────┘         └────────────────────┘      └────────────────────┘
           ▲
           │ (Webhook HTTP POST)
┌────────────────────┐
│ PAYMENT GATEWAY    │
│ (SePay/PayOS/Casso)│
└────────────────────┘
```

---

## 2. CHI TIẾT CÁC THÀNH PHẦN HẠ TẦNG

| Thành Phần | Nhà Cung Cấp | Vai Trò & Chức Năng | Lý Do Lựa Chọn |
| :--- | :--- | :--- | :--- |
| **Web Hosting & Compute** | Vercel Cloud | Deploy Next.js App Router, SSR/ISR Caching, Edge Middleware. | Tương thích 100% với Next.js, tốc độ Edge Network toàn cầu, deploy tự động từ Git. |
| **Database & Auth** | Supabase Cloud | PostgreSQL Database, Supabase Auth, Row Level Security. | Quản lý SQL chuẩn, RLS bảo mật DB level, Auth tích hợp sẵn. |
| **Video Delivery** | Bunny Stream / Cloudflare Stream | Lưu trữ video bài học, mã hóa HLS/DASH, Watermark động chống quay màn hình. | Tốc độ xem video mượt tại Việt Nam, chi phí cực rẻ so với AWS CloudFront, chống tải video. |
| **File Storage** | Supabase Storage / Cloudflare R2 | Lưu trữ thumbnail khóa học, tài liệu bài học (PDF, ZIP). | Không tốn phí Egress bandwidth (Cloudflare R2), bảo mật link tải bằng Signed URLs. |
| **Transactional Email** | Resend API | Gửi email kích hoạt tài khoản, email thông báo đơn hàng. | Tỷ lệ vào Inbox cao, API hiện đại tương thích mượt với React Email Templates. |
| **Payment Webhook** | SePay / PayOS / Casso | Kết nối Ngân hàng Việt Nam, bắn Webhook tức thì khi khách quét QR thành công. | Miễn phí giao dịch ngân hàng (0%), nhận webhook trong 1-3 giây. |

---

## 3. QUY TRÌNH DEPLOYMENT & MÔI TRƯỜNG (ENVIRONMENTS)

### 3.1 Môi trường Staging (Preview)
- Tự động tạo khi tạo Pull Request trên GitHub.
- Kết nối tới Supabase Staging Database.
- Dùng cho Đội ngũ Tester & Admin duyệt tính năng trước khi ra bản chính thức.

### 3.2 Môi trường Production
- Tự động deploy khi merge code vào nhánh `main`.
- Domain chính thức: `lms.kienpro.com` (hoặc domain do khách chọn).
- Cấu hình Vercel Analytics & Speed Insights để giám sát trải nghiệm người dùng thực tế.

---

## 4. CHIẾN LƯỢC SAO LƯU & PHỤC HỒI (BACKUP & DISASTER RECOVERY)

1. **Database Backup**:
   - Supabase tự động Sao lưu dữ liệu hàng ngày (Daily Automatic Backups).
   - Bật tính năng Point-in-Time Recovery (PITR) cho phép khôi phục dữ liệu về bất kỳ giây nào trong 7-30 ngày gần nhất.
2. **Video Asset Backup**:
   - Các file video gốc được lưu trên Bunny Stream Storage / Cloudflare Stream với chế độ nén dự phòng đa vùng (Multi-region replication).
