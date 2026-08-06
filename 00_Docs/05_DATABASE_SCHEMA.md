# THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA & RLS POLICIES)
## DỰ ÁN: KIENPRO LMS

---

## 1. TỔNG QUAN HỆ CƠ SỞ DỮ LIỆU

Hệ thống sử dụng **PostgreSQL** hosted trên **Supabase**. Dữ liệu được bảo mật ở cấp độ hàng bằng **Row Level Security (RLS)**.

Toàn bộ 16 bảng dữ liệu bắt buộc được thiết kế đầy đủ kiểu dữ liệu, khóa chính (UUID), khóa ngoại, ràng buộc duy nhất (Unique constraints), chỉ mục (Indexes) và chính sách RLS.

---

## 2. SƠ ĐỒ QUAN HỆ BẢNG (ERD - ENTITY RELATIONSHIP DIAGRAM)

```
[roles] 1 --- N [profiles] (via role_id)
[profiles] 1 --- N [orders] (via user_id)
[profiles] 1 --- N [enrollments] (via user_id)
[profiles] 1 --- N [lesson_progress] (via user_id)
[profiles] 1 --- N [notes] (via user_id)
[profiles] 1 --- N [activation_tokens] (via user_id)
[profiles] 1 --- N [notifications] (via user_id)
[profiles] 1 --- N [audit_logs] (via actor_id)

[courses] 1 --- N [modules] (via course_id)
[modules] 1 --- N [lessons] (via module_id)
[lessons] 1 --- N [lesson_resources] (via lesson_id)
[lessons] 1 --- N [lesson_progress] (via lesson_id)
[lessons] 1 --- N [notes] (via lesson_id)

[orders] 1 --- N [order_items] (via order_id)
[orders] 1 --- 1 [payments] (via order_id)
[courses] 1 --- N [order_items] (via course_id)
[courses] 1 --- N [enrollments] (via course_id)

[webhook_events] (Idempotency Tracking)
```

---

## 3. SCRIPTS SQL KHỞI TẠO BẢNG & CHÍNH SÁCH RLS

```sql
-- KÍCH HOẠT EXTENSION PHỔ BIẾN
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. BẢNG roles (Danh mục Vai trò Người dùng)
-- =============================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'instructor', 'support', 'student'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Seed dữ liệu vai trò ban đầu
INSERT INTO roles (code, name, description) VALUES
('super_admin', 'Quản trị viên tối cao', 'Toàn quyền hệ thống'),
('instructor', 'Giảng viên', 'Quản lý khóa học được gán'),
('support', 'Nhân viên Hỗ trợ', 'Quản lý đơn hàng & chăm sóc học viên'),
('student', 'Học viên', 'Truy cập khóa học đã mua')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 2. BẢNG profiles (Thông tin Chi tiết Người dùng)
-- =============================================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_activated BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 3. BẢNG courses (Khóa học)
-- =============================================================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2),
    status VARCHAR(50) DEFAULT 'draft' NOT NULL, -- 'draft', 'published', 'archived'
    instructor_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 4. BẢNG modules (Chương học)
-- =============================================================================
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 5. BẢNG lessons (Bài học)
-- =============================================================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT, -- Nội dung dạng Markdown / HTML
    video_provider VARCHAR(50) DEFAULT 'bunny', -- 'bunny', 'cloudflare', 'youtube'
    video_id VARCHAR(255), -- ID video trên Bunny/CF Stream
    duration_seconds INT DEFAULT 0 NOT NULL,
    is_free_preview BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 6. BẢNG lesson_resources (Tài liệu đính kèm Bài học)
-- =============================================================================
CREATE TABLE lesson_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50), -- 'pdf', 'zip', 'doc', 'link'
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 7. BẢNG orders (Đơn hàng)
-- =============================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) UNIQUE NOT NULL, -- Mã đơn dạng KP98241
    user_id UUID REFERENCES profiles(id), -- Có thể NULL nếu mua chưa có tài khoản
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- 'PENDING', 'PAID', 'CANCELLED', 'EXPIRED', 'REFUNDED'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 8. BẢNG order_items (Chi tiết Đơn hàng)
-- =============================================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id),
    price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 9. BẢNG payments (Lịch sử Giao dịch Thanh toán)
-- =============================================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'sepay', 'payos', 'casso'
    transaction_id VARCHAR(255) NOT NULL, -- Mã giao dịch ngân hàng
    amount NUMERIC(12, 2) NOT NULL,
    account_number VARCHAR(100),
    payment_content TEXT,
    paid_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 10. BẢNG enrollments (Quyền truy cập Khóa học của Học viên)
-- =============================================================================
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED'
    enrolled_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, course_id)
);

-- =============================================================================
-- 11. BẢNG lesson_progress (Tiến độ Học tập)
-- =============================================================================
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    last_watched_second INT DEFAULT 0 NOT NULL,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- =============================================================================
-- 12. BẢNG notes (Ghi chú Bài học của Học viên)
-- =============================================================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    video_timestamp_seconds INT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 13. BẢNG activation_tokens (Token Kích hoạt Tài khoản)
-- =============================================================================
CREATE TABLE activation_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 14. BẢNG notifications (Thông báo Hệ thống)
-- =============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================================================
-- 15. BẢNG webhook_events (Nhật ký Webhook & Chống xử lý trùng giao dịch)
-- =============================================================================
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL, -- 'sepay', 'payos', 'casso'
    transaction_id VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'SUCCESS' NOT NULL, -- 'SUCCESS', 'FAILED', 'IGNORED'
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(provider, transaction_id) -- BẮT BUỘC ĐỂ CHỐNG REPLAY
);

-- =============================================================================
-- 16. BẢNG audit_logs (Nhật ký Hoạt động Quản trị)
-- =============================================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    action VARCHAR(100) NOT NULL, -- 'MANUAL_ENROLLMENT', 'ROLE_CHANGE', 'COURSE_UPDATE'
    target_type VARCHAR(50) NOT NULL, -- 'user', 'order', 'course'
    target_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

## 4. KHỞI TẠO CHỈ MỤC (INDEXING STRATEGY FOR PERFORMANCE)

```sql
-- Indexes tối ưu tốc độ tra cứu
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_orders_order_code ON orders(order_code);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_lesson_progress_user_lesson ON lesson_progress(user_id, lesson_id);
CREATE INDEX idx_activation_tokens_token ON activation_tokens(token);
CREATE INDEX idx_webhook_events_provider_tx ON webhook_events(provider, transaction_id);
```

---

## 5. ROW LEVEL SECURITY (RLS) POLICIES BẢO MẬT

```sql
-- Bật RLS cho tất cả các bảng
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Profiles - User xem bản thân, Admin xem tất cả
CREATE POLICY "Profiles self view" ON profiles FOR SELECT USING (auth.uid() = id);

-- Policy 2: Courses - Tất cả mọi người xem bài giảng published
CREATE POLICY "Public courses view" ON courses FOR SELECT USING (status = 'published');

-- Policy 3: Lessons - Chỉ cho xem nếu có Enrollment ACTIVE hợp lệ (hoặc là preview miễn phí)
CREATE POLICY "Student access lessons" ON lessons FOR SELECT USING (
    is_free_preview = TRUE 
    OR EXISTS (
        SELECT 1 FROM modules m
        JOIN enrollments e ON e.course_id = m.course_id
        WHERE m.id = lessons.module_id
          AND e.user_id = auth.uid()
          AND e.status = 'ACTIVE'
    )
);

-- Policy 4: Lesson Progress - Học viên chỉ xem & sửa tiến độ của bản thân
CREATE POLICY "Student manage progress" ON lesson_progress 
    FOR ALL USING (auth.uid() = user_id);

-- Policy 5: Notes - Học viên chỉ xem & sửa ghi chú của bản thân
CREATE POLICY "Student manage notes" ON notes 
    FOR ALL USING (auth.uid() = user_id);
```
