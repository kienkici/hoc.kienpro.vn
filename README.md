# KIENPRO LMS - NỀN TẢNG ĐÀO TẠO TRỰC TUYẾN CAO CẤP KIÊN PRO

![KIENPRO LMS Banner](https://placehold.co/1200x400/09090B/D4AF37?text=KIENPRO+LMS+-+PREMIUM+ONLINE+LEARNING+PLATFORM)

---

## 🚀 TỔNG QUAN DỰ ÁN

**KIENPRO LMS** là hệ thống quản lý đào tạo trực tuyến (Learning Management System) chuẩn hóa dành cho thương hiệu **Kiên Pro**. Nền tảng được thiết kế với tiêu chuẩn kỹ thuật hiện đại, bảo mật cao và giao diện Premium Gold/Dark sang trọng, tối giản, thân thiện với người không rành công nghệ.

### Các Điểm Nổi Bật:
1. **Thanh toán VietQR & Cấp khóa học tự động 100%**: Nhận Webhook SePay/PayOS/Casso, tự động kích hoạt khóa học trong dưới **10 giây**.
2. **Bảo mật Chống xử lý trùng giao dịch (Anti-replay Idempotency)**: Database Transaction + Unique key đảm bảo không cộng trùng khóa học.
3. **Kích hoạt tài khoản an toàn**: Học viên nhận email chứa link có hạn (72h) để tự tạo mật khẩu lần đầu. Không bao giờ gửi mật khẩu văn bản qua Email/Zalo.
4. **Phát Video mã hóa chống tải xuống**: Tích hợp Bunny Stream / Cloudflare Stream phát HLS chuẩn nét.
5. **Bảo mật dữ liệu chuẩn Supabase RLS & RBAC**: Phân quyền Super Admin, Instructor, Support và Student chặt chẽ ở cấp độ Database và Server.

---

## 🛠 TECH STACK BẮT BUỘC

- **Framework**: Next.js 14+ (App Router, TypeScript Strict Mode).
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons.
- **Database**: PostgreSQL hosted on **Supabase** (với Row Level Security).
- **Authentication**: Supabase Auth + Activation Tokens.
- **Video Storage & Streaming**: Bunny Stream / Cloudflare Stream.
- **File Storage**: Supabase Storage / Cloudflare R2.
- **Transactional Email**: Resend API.
- **Payment Webhook**: SePay / PayOS / Casso.
- **Validation & Forms**: Zod + React Hook Form.
- **Testing**: Vitest (Unit) & Playwright (E2E).
- **Deployment**: Vercel.

---

## 📁 CẤU TRÚC THƯ MỤC NỔI BẬT

```text
├── 00_Docs/                  # Bộ tài liệu thiết kế hệ thống toàn diện (PRD, Schema, Webhook, Security...)
├── AGENTS.md                 # Quy tắc hoạt động dành cho các AI Agent
├── src/
│   ├── app/                  # Next.js App Router (Public, Student, Admin, API Routes)
│   ├── components/           # UI Components (Gold/Dark Design System)
│   ├── lib/                  # Integrations (Supabase, Resend, Bunny Stream, Auth Guards)
│   ├── server/               # Server Actions & Zod Validators
│   └── types/                # TypeScript Type Definitions
├── tests/
│   ├── unit/                 # Vitest Unit & Integration Tests
│   └── e2e/                  # Playwright End-to-End Tests
├── .env.example              # Mẫu biến môi trường (Không chứa secret thật)
└── README.md                 # Tài liệu hướng dẫn này
```

---

## ⚙️ HƯỚNG DẪN CÀI ĐẶT & PHÁT TRIỂN (DEVELOPMENT SETUP)

### 1. Yêu cầu Môi trường
- Node.js version 18.17.0 trở lên.
- pnpm / npm / yarn.
- Tài khoản Supabase, Resend, Bunny Stream (hoặc Cloudflare Stream), SePay/PayOS.

### 2. Thiết lập Biến môi trường
Copy file mẫu `.env.example` thành `.env.local` và điền các tham số tương ứng:

```bash
cp .env.example .env.local
```

### 3. Cài đặt các gói phụ thuộc (Dependencies)
```bash
npm install
```

### 4. Khởi chạy Môi trường Phát triển (Local Dev Server)
```bash
npm run dev
```
Truy cập ứng dụng tại: `http://localhost:3000`

### 5. Chạy Kiểm thử (Testing)
```bash
# Chạy Unit Tests với Vitest
npm run test:unit

# Chạy End-to-End Tests với Playwright
npm run test:e2e
```

---

## 📚 TÀI LIỆU KIẾN TRÚC CHI TIẾT IN `00_Docs/`

1. [`01_PRD.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/01_PRD.md) - Yêu cầu sản phẩm & Tầm nhìn hệ thống.
2. [`02_ROLES_PERMISSIONS.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/02_ROLES_PERMISSIONS.md) - Ma trận phân quyền RBAC.
3. [`03_USER_FLOWS.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/03_USER_FLOWS.md) - Sơ đồ luồng mua hàng, webhook & kích hoạt tài khoản.
4. [`04_FEATURE_SCOPE.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/04_FEATURE_SCOPE.md) - Lộ trình phạm vi tính năng MVP, V2 & V3 (AI Mentor).
5. [`05_DATABASE_SCHEMA.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/05_DATABASE_SCHEMA.md) - Thiết kế DB 16 bảng, SQL DDL & RLS Policies.
6. [`06_API_WEBHOOK_SPEC.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/06_API_WEBHOOK_SPEC.md) - Quy chuẩn API & Webhook thanh toán.
7. [`07_UI_UX_GUIDELINES.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/07_UI_UX_GUIDELINES.md) - Design System Gold/Dark Minimalist.
8. [`08_SECURITY_REQUIREMENTS.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/08_SECURITY_REQUIREMENTS.md) - Chính sách & Quy tắc bảo mật hệ thống.
9. [`09_TESTING_STRATEGY.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/09_TESTING_STRATEGY.md) - Chiến lược kiểm thử Vitest & Playwright.
10. [`10_DEPLOYMENT_ARCHITECTURE.md`](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/00_Docs/10_DEPLOYMENT_ARCHITECTURE.md) - Mô hình hạ tầng Vercel & Supabase.
