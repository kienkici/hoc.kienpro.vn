-- =============================================================================
-- KIENPRO LMS - SEED DATA FOR DEVELOPMENT (DỮ LIỆU MẪU PHÁT TRIỂN)
-- =============================================================================

-- 1. SEED KHÓA HỌC MẪU (Để trống instructor_id và created_by để tránh ràng buộc khoá ngoại auth.users)
INSERT INTO courses (
    id, title, slug, short_description, description, category, instructor_id, 
    original_price, sale_price, access_duration_days, status, certificate_enabled, 
    completion_percentage, created_by, created_at, updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Khóa Học Thiết Kế Website AI & Tự Động Hóa Bán Hàng 2026',
    'thiet-ke-website-ai',
    'Xây dựng website bán hàng cao cấp, tích hợp Chatbot AI và quy trình tự động hóa chuyển đổi 10x',
    'Khóa học thực chiến giúp bạn tự tay thiết kế Landing Page & Website LMS chuyên nghiệp chuẩn thương hiệu cao cấp mà không cần biết viết code phức tạp.',
    'thiet-ke',
    NULL,
    3500000.00,
    1490000.00,
    null,
    'published',
    true,
    80,
    NULL,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. SEED 3 MODULES MẪU
INSERT INTO course_modules (id, course_id, title, description, order_index, status) VALUES
('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Chương 1: Tổng quan Kiến trúc & Tư duy Thiết kế Premium Gold/Dark', 'Giới thiệu tư duy thiết kế và hệ thống UI Tokens', 0, 'published'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Chương 2: Tự động hóa Thanh toán QR & Cấp Khóa Học 10 Giây', 'Cấu hình webhook nhận chuyển khoản tự động', 1, 'published'),
('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Chương 3: Tích hợp Trí Tuệ Nhân Tạo AI Mentor', 'Tích hợp mô hình AI hỏi đáp với học viên', 2, 'published')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED 6 BÀI HỌC MẪU (2 bài mỗi module)
INSERT INTO lessons (
    id, module_id, course_id, title, slug, description, content, lesson_type, 
    duration_seconds, video_provider, video_id, is_preview, is_required, order_index, status
) VALUES
-- Module 1
('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 
'Bài 1: Giới thiệu hệ thống KIENPRO LMS & Tư duy giao diện cao cấp', 'gioi-thieu-kienpro-lms', 
'Giới thiệu tổng quan hệ thống.', 'Nội dung bài học giới thiệu chi tiết về triết lý Gold Premium.', 'video', 750, 'bunny', 'abc123-bunny', true, true, 0, 'published'),

('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 
'Bài 2: Cài đặt công cụ & Chuẩn bị môi trường Next.js', 'cai-dat-cong-cu-nextjs', 
'Hướng dẫn cài đặt môi trường Next.js.', 'Các bước cài đặt Node.js, Git và khởi tạo project Next.js.', 'video', 1140, 'bunny', 'def456-bunny', false, true, 1, 'published'),

-- Module 2
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 
'Bài 3: Cấu hình SePay Webhook & Quy trình Anti-Replay Idempotency', 'cau-hinh-sepay-webhook', 
'Cách cấu hình cổng thanh toán nhận webhook.', 'Hướng dẫn bảo mật tránh nhận trùng lặp giao dịch (Anti-replay idempotency pattern).', 'video', 1420, 'bunny', 'ghi789-bunny', false, true, 0, 'published'),

('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 
'Bài 4: Tích hợp VietQR Dynamic sinh mã thanh toán theo đơn hàng', 'vietqr-dynamic-code', 
'Sinh mã QR ngân hàng động.', 'Phương pháp sinh mã VietQR theo chuẩn Napas247 chứa số tiền và nội dung chuyển khoản động.', 'video', 980, 'bunny', 'jkl012-bunny', false, true, 1, 'published'),

-- Module 3
('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 
'Bài 5: Hướng dẫn cấu hình Vector Database cho AI Mentor', 'vector-db-ai-mentor', 
'Xây dựng cơ sở dữ liệu tri thức.', 'Cách nhúng (embedding) tài liệu bài học vào Pinecone hoặc Supabase pgvector.', 'video', 1200, 'bunny', 'mno345-bunny', false, true, 0, 'published'),

('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 
'Bài 6: Xây dựng giao diện Chatbot AI Mentor học tập thông minh', 'chatbot-ai-mentor-ui', 
'Giao diện Chatbot học viên.', 'Phát triển giao diện Chatbot tích hợp trong trang học bài, hỗ trợ trả lời câu hỏi trực tiếp.', 'video', 1500, 'bunny', 'pqr678-bunny', false, true, 1, 'published')
ON CONFLICT (id) DO NOTHING;
