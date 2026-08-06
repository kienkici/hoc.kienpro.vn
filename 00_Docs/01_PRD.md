# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRODUCT REQUIREMENTS DOCUMENT - PRD)
## DỰ ÁN: KIENPRO LMS (HỆ THỐNG ĐÀO TẠO TRỰC TUYẾN KIÊN PRO)

---

## 1. MỤC TIÊU DỰ ÁN & TỔNG QUAN

### 1.1 Tầm nhìn sản phẩm
**KIENPRO LMS** là nền tảng đào tạo trực tuyến chuẩn LMS (Learning Management System) cao cấp được xây dựng riêng cho thương hiệu **Kiên Pro**. Nền tảng hướng tới việc cung cấp trải nghiệm học tập hiện đại, mượt mà, tối giản nhưng vô cùng chuyên nghiệp dành cho học viên; đồng thời tự động hóa toàn bộ quy trình từ bán hàng, nhận thanh toán ngân hàng qua mã QR, cấp tài khoản, kích hoạt tự động đến quản lý tiến độ học tập và ghi nhận doanh thu cho Ban quản trị (Admin).

### 1.2 Mục tiêu kinh doanh & Vận hành (KPIs)
- **Tự động hóa 100% quy trình cấp khóa học**: Giảm thời gian xử lý đơn hàng từ trung bình 15-30 phút (thủ công) xuống dưới **10 giây** sau khi khách hàng chuyển khoản thành công.
- **Trải nghiệm người dùng thân thiện (Zero-friction onboarding)**: Học viên không cần đăng ký tài khoản trước khi mua. Việc tạo tài khoản, gửi link kích hoạt tự động qua Email chỉ mất 1 chạm.
- **Tỷ lệ truy cập & Học lại cao**: Giao diện tối ưu hóa cho Desktop, Tablet và Mobile; tốc độ tải trang dưới **1.5 giây** (Core Web Vitals chuẩn Green).
- **An toàn & Bảo mật tuyệt đối**: Không lộ link video, chống share tài khoản bất hợp pháp, bảo mật thông tin giao dịch và dữ liệu học viên theo chuẩn mã hóa hiện đại.

---

## 2. PHÂN TÍCH ĐỐI TƯỢNG SỬ DỤNG (TARGET USER PERSONAS)

### 2.1 Học viên (Student / Learner)
- **Đặc điểm**: Học viên đăng ký học các khóa học của Kiên Pro (kinh doanh, kỹ năng, công nghệ, thiết kế...). Đa dạng độ tuổi, có nhiều người không rành về kỹ thuật hoặc công nghệ phức tạp.
- **Nhu cầu cốt lõi**:
  - Mua khóa học nhanh chóng qua quét mã QR Ngân hàng (VietQR / SePay / PayOS / Casso).
  - Nhận email hướng dẫn tạo mật khẩu và truy cập học ngay lập tức.
  - Giao diện học trực quan: danh sách bài học, trình phát video chất lượng cao không giật lag, tài liệu tải về, ghi chú bài học.
  - Theo dõi được tiến độ (%) hoàn thành khóa học và đánh dấu bài đã học.

### 2.2 Giảng viên / Người tạo nội dung (Instructor)
- **Nhu cầu cốt lõi**:
  - Tạo và quản lý cấu trúc khóa học (Khóa học -> Chương/Module -> Bài học/Lesson).
  - Tải lên bài giảng (Video Bunny Stream / Cloudflare Stream, PDF, file đính kèm).
  - Xem báo cáo số lượng học viên, tỉ lệ hoàn thành bài học.

### 2.3 Đội ngũ Hỗ trợ / CSKH (Support Staff)
- **Nhu cầu cốt lõi**:
  - Tra cứu nhanh thông tin đơn hàng, trạng thái thanh toán, email học viên.
  - Hỗ trợ gửi lại email kích hoạt (Resend Activation Email) khi học viên gõ sai email hoặc không nhận được email.
  - Kích hoạt khóa học thủ công trong trường hợp giao dịch bị treo hoặc khách hàng chuyển khoản sai cú pháp.

### 2.4 Quản trị viên cao cấp (Super Admin)
- **Nhu cầu cốt lõi**:
  - Toàn quyền quản trị hệ thống: Phân quyền người dùng (RBAC), quản lý cấu hình thanh toán webhook, xem doanh thu, xem Audit Logs bảo mật.
  - Quản lý mã giảm giá, khuyến mãi, danh mục khóa học.

---

## 3. NGUYÊN TẮC THIẾT KẾ & TECH STACK BẮT BUỘC

### 3.1 Tech Stack Chuẩn hóa
- **Frontend Framework**: Next.js (App Router, TypeScript Strict Mode).
- **Styling & UI**: Tailwind CSS, shadcn/ui (Custom components), Lucide Icons.
- **Database**: PostgreSQL hosted on Supabase DB với Row Level Security (RLS) bắt buộc.
- **Authentication**: Supabase Auth (Email + Custom Token Activation).
- **Video Storage & Streaming**: Bunny Stream hoặc Cloudflare Stream (HLS/DASH Encrypted Streaming, Custom Watermark).
- **File Storage**: Supabase Storage / Cloudflare R2 (PDF, tài liệu bài học).
- **Transactional Email**: Resend API (Gửi email kích hoạt, khôi phục mật khẩu, xác nhận đơn hàng).
- **Payment & Webhook**: SePay / PayOS / Casso (Xử lý VietQR webhook tự động).
- **Validation**: Zod (Schema validation trên cả Client & Server Actions).
- **Form Management**: React Hook Form (kết hợp Zod resolver).
- **Testing**: Vitest (Unit test) & Playwright (End-to-End test).
- **Hosting & Deployment**: Vercel (Production & Staging environments).

### 3.2 Phong cách Thiết kế (Brand Identity & UI/UX Design Guidelines)
- **Thương hiệu**: KIENPRO LMS.
- **Màu chủ đạo**:
  - Gold Accent: `#D4AF37` / `#E5C158` (Tượng trưng cho sự uy tín, chất lượng cao cấp).
  - Background: Đen thuần (`#09090B` / `#000000`) & Trắng tinh khôi (`#FFFFFF` / `#FAFAFA`).
  - Text & Muted: Slate/Zinc tones (`#71717A`, `#A1A1AA`, `#F4F4F5`).
- **Triết lý UX**: High Contrast, Premium Look, Minimalist, Zero Clutter. Đặt độ tiện dụng lên hàng đầu cho người dùng không rành công nghệ.

---

## 4. TỔNG QUAN CHỨC NĂNG CỐT LÕI (CORE FUNCTIONALITIES)

1. **Trang chủ & Danh sách khóa học (Public Catalog & Landing Pages)**:
   - Hiển thị thông tin khóa học, lộ trình học, video học thử (demo), học phí, quà tặng kèm.
2. **Checkout & Thanh toán QR Tự động (VietQR Instant Checkout)**:
   - Khách điền Thông tin (Họ tên, Email, SĐT).
   - Hệ thống tạo Đơn hàng (`orders`) + Mã thanh toán duy nhất (`ORDER_CODE`).
   - Hiển thị QR Code ngân hàng (có nhúng Mã đơn hàng vào Nội dung chuyển khoản).
3. **Webhook Receiver & Anti-Replay Processing**:
   - Nhận Webhook từ SePay/PayOS/Casso.
   - Kiểm tra Signature / Secret Header.
   - Kiểm tra trùng lặp giao dịch (Idempotency Key via `webhook_events` table).
   - Đối soát số tiền & Nội dung chuyển khoản với Đơn hàng tương ứng.
4. **Cấp khóa học & Tạo tài khoản tự động**:
   - Tìm kiếm `profiles` theo Email. Nếu chưa có -> Tạo tài khoản ngẫu nhiên (Auth user) + Tạo `activation_token`.
   - Cấp bản ghi `enrollments` cho học viên với khóa học tương ứng.
5. **Kích hoạt tài khoản qua Email (Resend)**:
   - Gửi Email kích hoạt chứa liên kết an toàn có thời hạn (ví dụ: 72 giờ).
   - Học viên bấm link -> Chuyển sang giao diện Đặt mật khẩu lần đầu (`Set Password`).
6. **Hệ thống Học tập (Student LMS Portal)**:
   - Dashboard khóa học đã đăng ký.
   - Trình xem bài học (Video streaming chất lượng cao, bài viết Markdown, tài liệu PDF).
   - Theo dõi tiến độ hoàn thành bài học (Lesson Progress) tự động tích xanh khi xem > 90% video hoặc bấm "Hoàn thành".
   - Tính năng ghi chú bài học (Notes).
7. **Hệ thống Quản trị (Admin Portal)**:
   - Quản lý Khóa học, Module, Bài học, Upload video/tài liệu.
   - Quản lý Học viên, trạng thái kích hoạt, gán/thu hồi khóa học thủ công.
   - Quản lý Đơn hàng, Lịch sử giao dịch thanh toán.
   - Xem Nhật ký hoạt động hệ thống (Audit Logs).

---

## 5. TÀI LIỆU LIÊN QUAN TRONG THƯ MỤC `00_Docs/`
- `02_ROLES_PERMISSIONS.md`: Phân quyền người dùng & Bảng ma trận đặc quyền.
- `03_USER_FLOWS.md`: Sơ đồ luồng chi tiết cho tất cả các kịch bản.
- `04_FEATURE_SCOPE.md`: Chi tiết phạm vi tính năng MVP, V2 và V3.
- `05_DATABASE_SCHEMA.md`: Bản thiết kế DB PostgreSQL 16 bảng & RLS script.
- `06_API_WEBHOOK_SPEC.md`: Quy chuẩn API & Xử lý Webhook thanh toán.
- `07_UI_UX_GUIDELINES.md`: Hệ thống thiết kế UI/UX Gold/Dark Premium.
- `08_SECURITY_REQUIREMENTS.md`: Yêu cầu và quy tắc bảo mật toàn hệ thống.
- `09_TESTING_STRATEGY.md`: Kế hoạch test tự động Vitest & Playwright.
- `10_DEPLOYMENT_ARCHITECTURE.md`: Mô hình hạ tầng triển khai Vercel & Supabase.
