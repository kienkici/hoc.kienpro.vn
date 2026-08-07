-- =============================================================================
-- KIENPRO LMS - THÊM CÁC CỘT UTM THEO DÕI NGUỒN ĐƠN HÀNG
-- =============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);
