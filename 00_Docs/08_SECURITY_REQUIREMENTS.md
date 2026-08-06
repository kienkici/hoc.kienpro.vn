# YÊU CẦU & CHÍNH SÁCH BẢO MẬT HỆ THỐNG (SECURITY REQUIREMENTS SPECIFICATION)
## DỰ ÁN: KIENPRO LMS

---

## 1. MẬT KHẨU & TÀI KHOẢN (AUTHENTICATION SECURITY)

1. **Tuyệt đối Không gửi Mật khẩu văn bản thuần (Plaintext)**:
   - Hệ thống KHÔNG BAO GIỜ sinh mật khẩu ngẫu nhiên rồi gửi qua Email, SMS hay Zalo cho học viên.
   - Khi cấp tài khoản tự động, tạo token kích hoạt duy nhất (`activation_token`) lưu trong database.
2. **Liên kết Kích hoạt có Thời hạn (Expiring Activation Links)**:
   - Link kích hoạt có định dạng: `https://lms.kienpro.com/activate?token=<crypto_uuid>`.
   - Thời hạn hiệu lực mặc định: **72 giờ** (3 ngày).
   - Token sau khi đã sử dụng (`used_at IS NOT NULL`) hoặc quá hạn sẽ lập tức bị vô hiệu hóa.
3. **Chính sách Mật khẩu học viên**:
   - Độ dài tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ cái và 1 chữ số.
   - Mật khẩu được mã hóa an toàn bằng thuật toán `Bcrypt` / `Argon2` thông qua Supabase Auth.

---

## 2. BẢO MẬT THANH TOÁN & WEBHOOK (PAYMENT & WEBHOOK SECURITY)

1. **Xác thực Chữ ký Webhook (Signature Verification)**:
   - Tất cả request webhook gửi đến `POST /api/webhooks/payment` đều phải được kiểm tra chữ ký HMAC (Secret Signature Header) do nhà cung cấp SePay / PayOS cung cấp.
   - Trả lỗi `401 Unauthorized` ngay lập tức nếu signature không trùng khớp.
2. **Cơ chế Chống xử lý trùng giao dịch (Anti-Replay / Idempotency)**:
   - Sử dụng ràng buộc `UNIQUE(provider, transaction_id)` trên bảng `webhook_events`.
   - Kết hợp PostgreSQL Database Transaction isolation level để chặn race condition khi webhook bị nhà mạng retry nhiều lần cùng lúc.
3. **Che giấu Thông tin Thanh toán Nhạy cảm trong Log (Log Masking)**:
   - Không ghi số tài khoản ngân hàng đầy đủ, số dư tài khoản, hoặc thông tin cá nhân khách hàng vào console log hoặc hệ thống giám sát log (Vercel Logs/Sentry).

---

## 3. QUẢN LÝ DỮ LIỆU & RLS (DATA PROTECTION & ROW LEVEL SECURITY)

1. **Supabase Row Level Security (RLS)**:
   - Mọi bảng trong DB phải bật `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`.
   - Học viên chỉ có thể đọc bài học của khóa học mà bản ghi `enrollments` của họ có trạng thái `ACTIVE`.
   - Tránh việc học viên mò ra URL API để tải video hoặc xem tài liệu khi chưa trả tiền.
2. **Không lưu Secret trong Source Code**:
   - TẤT CẢ API Keys, DB Passwords, Resend Keys, Webhook Secrets phải được lưu trong biến môi trường (`.env.local` / Vercel Environment Variables).
   - Thêm `.env*` vào `.gitignore` để tránh đẩy secret lên GitHub.

---

## 4. KIỂM TRA QUYỀN TRÊN SERVER (SERVER-SIDE AUTHORIZATION)

1. **Không phụ thuộc vào Ẩn UI (Server-side Enforcement)**:
   - Không chỉ ẩn nút "Sửa bài học" hay "Kích hoạt đơn hàng" trên giao diện Client.
   - Mọi Server Action và API Route phải kiểm tra JWT Token và Role của User trước khi thực thi lệnh SQL.
2. **Kiểm tra Tính hợp lệ của Enrollment**:
   - Trước khi trả về URL stream video hoặc file tài liệu, server kiểm tra:
     `SELECT 1 FROM enrollments WHERE user_id = :uid AND course_id = :cid AND status = 'ACTIVE'`.

---

## 5. NHẬT KÝ BẢO MẬT & GIÁM SÁT (AUDIT LOGGING)

1. **Tất cả các hành động quản trị quan trọng phải ghi bản ghi vào `audit_logs`**:
   - Thao tác gán/thu hồi khóa học thủ công.
   - Thao tác thay đổi Vai trò người dùng (User Role).
   - Thao tác xóa hoặc ẩn khóa học.
   - Thao tác hoàn tiền đơn hàng.
2. **Nội dung bản ghi Audit Log**:
   - IP Address, User Agent, Timestamp, Actor ID, Old Values, New Values.
