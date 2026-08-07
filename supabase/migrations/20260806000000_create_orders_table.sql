-- =============================================================================
-- KIENPRO LMS - ADD ORDERS & WEBHOOK EVENTS TABLES FOR PAYMENT INTEGRATION
-- =============================================================================

-- 1. BỔ SUNG CỘT BỊ THIẾU CHO BẢNG PROFILES (ĐỂ PHỤC VỤ KÍCH HOẠT TÀI KHOẢN)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_activated BOOLEAN DEFAULT false;

-- 2. TẠO BẢNG ĐƠN HÀNG (ORDERS)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- Ví dụ: KP98241
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật bảo mật Row Level Security (RLS) cho bảng orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép công khai INSERT đơn hàng từ trang Checkout
CREATE POLICY "Allow public insert on orders" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Tạo chính sách cho phép truy cập SELECT theo code đơn hàng công khai
CREATE POLICY "Allow public select on orders by code" 
ON orders FOR SELECT 
USING (true);

-- Tạo chính sách cho phép Admin quản lý toàn quyền đơn hàng
CREATE POLICY "Allow admin all access on orders" 
ON orders FOR ALL 
TO authenticated 
USING (true);


-- 3. TẠO BẢNG WEBHOOK_EVENTS (Để chống xử lý trùng lặp giao dịch - Idempotency)
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL, -- sepay, payos, casso
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật bảo mật RLS cho bảng webhook_events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Cho phép Admin quản trị viên xem log webhook
CREATE POLICY "Allow admin access on webhook_events" 
ON webhook_events FOR ALL 
TO authenticated 
USING (true);


-- 4. TẠO BẢNG MÃ KÍCH HOẠT TÀI KHOẢN (ACTIVATION_TOKENS)
CREATE TABLE IF NOT EXISTS activation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    token VARCHAR(100) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật bảo mật RLS cho bảng activation_tokens
ALTER TABLE activation_tokens ENABLE ROW LEVEL SECURITY;

-- Cho phép Admin quản trị viên xem và quản lý tokens
CREATE POLICY "Allow admin access on activation_tokens" 
ON activation_tokens FOR ALL 
TO authenticated 
USING (true);
