# PHẠM VI TÍNH NĂNG THEO LỘ TRÌNH (FEATURE SCOPE ROADMAP)
## DỰ ÁN: KIENPRO LMS

---

## 1. NGUYÊN TẮC PHÂN CHIA PHẠM VI (SCOPE PRINCIPLES)

Để đảm bảo dự án phát triển nhanh chóng, ổn định, không bị phình phạm vi (Scope Creep) và bàn giao sản phẩm chất lượng cao nhất, tính năng của **KIENPRO LMS** được chia làm 3 giai đoạn rõ ràng:

1. **Giai đoạn MVP (Minimum Viable Product - Version 1.0)**: Tập trung 100% vào luồng bán khóa học, thanh toán QR tự động, kích hoạt tài khoản qua email, xem video bài giảng mượt mà và giao diện Admin quản lý cơ bản.
2. **Giai đoạn Version 2.0**: Mở rộng tương tác học viên, chứng chỉ hoàn thành, khuyến mãi nâng cao, affiliate/giới thiệu và báo cáo doanh thu chuyên sâu.
3. **Giai đoạn Version 3.0**: Tích hợp trợ lý thông minh **AI Mentor**, chấm bài tập tự động, cá nhân hóa lộ trình học bằng AI.

---

## 2. CHI TIẾT TÍNH NĂNG THEO TỪNG GIAI ĐOẠN

### GIAI ĐOẠN MVP (VERSION 1.0 - HIỆN TẠI)

#### A. Dành cho Học viên (Public & Student Portal)
- [x] **Trang chủ & Landing Page khóa học**:
  - Giới thiệu thương hiệu Kiên Pro.
  - Catalog khóa học, chi tiết lộ trình bài học, thông tin học phí, nút mua hàng.
- [x] **Luồng Checkout & Thanh toán QR Ngân hàng (VietQR)**:
  - Form thu thập Họ tên, Email, Số điện thoại.
  - Tự động sinh mã QR ngân hàng chuẩn VietQR kèm Mã đơn hàng duy nhất.
  - Màn hình đếm ngược thanh toán và thông báo thành công thời gian thực.
- [x] **Kích hoạt tài khoản an toàn qua Email**:
  - Gửi email kích hoạt qua Resend API chứa link xác nhận có thời hạn (72h).
  - Giao diện đặt mật khẩu lần đầu cho học viên mới.
- [x] **Cổng Học tập (Learning Portal)**:
  - Xem danh sách các khóa học đã sở hữu.
  - Trình phát video chuẩn HLS (Bunny Stream / Cloudflare Stream) chống tải xuống.
  - Đánh dấu "Hoàn thành bài học" & Tự động lưu tiến độ học tập (%).
  - Ghi chú cá nhân theo từng bài học (Notes).
  - Tải tài liệu bài học (PDF, ZIP, đính kèm).

#### B. Dành cho Quản trị viên (Admin Portal)
- [x] **Quản lý Khóa học & Bài giảng**:
  - Tạo, sửa, xóa Khóa học (Course), Chương (Module), Bài học (Lesson).
  - Đăng tải video lên Bunny Stream / Cloudflare Stream.
  - Đăng tải tài liệu học đính kèm lên Supabase Storage / R2.
- [x] **Quản lý Đơn hàng & Thanh toán**:
  - Danh sách đơn hàng (`PENDING`, `PAID`, `CANCELLED`).
  - Lịch sử giao dịch webhook từ SePay/PayOS.
  - Công cụ Kích hoạt khóa học thủ công (Manual Enrollment) cho CSKH.
- [x] **Quản lý Học viên & Phân quyền**:
  - Danh sách học viên, ngày đăng ký, khóa học sở hữu.
  - Gửi lại email kích hoạt (Resend Activation Email).
- [x] **Bảo mật & Hệ thống**:
  - Nhận Webhook an toàn, chống xử lý trùng lặp giao dịch (Idempotency).
  - Phân quyền RBAC (Super Admin, Instructor, Support, Student).
  - Nhật ký hoạt động quản trị (Audit Logs).

---

### GIAI ĐOẠN VERSION 2.0 (NÂNG CAO TRẢI NGHIỆM & KINH DOANH)

- [ ] **Mã giảm giá & Khuyến mãi (Vouchers & Coupons)**:
  - Tạo mã giảm giá theo %, theo số tiền cố định, giới hạn lượt dùng hoặc thời hạn.
- [ ] **Chứng chỉ Hoàn thành Khóa học (Digital Certificate)**:
  - Tự động sinh file PDF chứng chỉ chuẩn thương hiệu Kiên Pro khi học viên đạt 100% tiến độ.
  - Mã tra cứu chứng chỉ công khai (Verify Certificate Page).
- [ ] **Đánh giá & Bình luận Bài học (Comments & Ratings)**:
  - Học viên gửi câu hỏi bên dưới bài học.
  - Giảng viên/Support trả lời thảo luận.
- [ ] **Báo cáo Doanh thu & Analytics Chuyên sâu**:
  - Biểu đồ doanh thu theo ngày/tần/tháng.
  - Tỷ lệ học viên hoàn thành khóa học, bài học có lượt xem cao nhất.
- [ ] **Hệ thống Tiếp thị Liên kết (Affiliate / Referral System)**:
  - Mã giới thiệu cho đối tác, theo dõi hoa hồng chuyển khoản.

---

### GIAI ĐOẠN VERSION 3.0 (TÍCH HỢP TRỢ LÝ AI MENTOR)

- [ ] **Trợ lý AI Mentor trong Màn hình Học**:
  - AI Chatbot được huấn luyện (Fine-tune / RAG) dựa trên nội dung tài liệu và transcript video của khóa học Kiên Pro.
  - Học viên có thể hỏi đáp trực tiếp với AI Mentor ngay khi đang xem video bài giảng.
- [ ] **Chấm bài tập tự động bằng AI**:
  - AI đọc bài nộp của học viên (viết luận hoặc code) và đưa ra nhận xét, chấm điểm chi tiết.
- [ ] **Tóm tắt bài học tự động (AI Lesson Summary)**:
  - AI tự động trích xuất ý chính và làm nổi bật nội dung quan trọng của từng bài học.
- [ ] **Cá nhân hóa Lộ trình Học (Adaptive Learning Pathway)**:
  - Khuyên dùng bài học tiếp theo dựa trên tốc độ tiếp thu và kết quả kiểm tra của học viên.

---

## 3. CÁC TÍNH NĂNG TUYỆT ĐỐI KHÔNG LÀM TRONG MVP (NON-SCOPE FOR MVP)

Để tập trung hoàn thành tốt nhất Giai đoạn 1 và MVP, các tính năng sau đây **KHÔNG THỰC HIỆN** trong bản đầu tiên:
1. Không làm livestream trực tiếp trên web (Dùng Zoom / Google Meet nếu cần).
2. Không làm cổng thanh toán thẻ quốc tế Visa/Mastercard (Chỉ tập trung VietQR Chuyển khoản ngân hàng qua Webhook để phí 0%).
3. Không làm ứng dụng di động native iOS/Android (Web responsive 100% trên điện thoại di động).
4. Không làm diễn đàn / mạng xã hội nội bộ phức tạp.
5. Không viết code AI Mentor ở giai đoạn MVP (Chỉ thiết kế kiến trúc DB sẵn sàng mở rộng).
