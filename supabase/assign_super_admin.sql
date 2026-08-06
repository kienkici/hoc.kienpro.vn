-- =============================================================================
-- KIENPRO LMS - SQL UTILITY: ASSIGN SUPER ADMIN ROLE
-- =============================================================================
--
-- HƯỚNG DẪN SỬ DỤNG:
-- 1. Đăng ký tài khoản email/password trong Supabase Auth (hoặc đăng ký trên web).
-- 2. Tìm ID (UUID) của tài khoản đó trong Supabase Authentication Dashboard.
-- 3. Thay thế giá trị '<USER_UUID_PLACEHOLDER>' bằng UUID thật của bạn.
-- 4. Chạy câu lệnh SQL này trong SQL Editor của Supabase.

DO $$
DECLARE
    target_user_id UUID := '<USER_UUID_PLACEHOLDER>'; -- Hãy thay thế UUID của bạn vào đây
BEGIN
    -- 1. Đảm bảo hồ sơ người dùng đã tồn tại trong public.profiles
    INSERT INTO public.profiles (id, full_name, phone, status, created_at, updated_at)
    VALUES (
        target_user_id,
        'Kiên Pro Admin',
        '0909.999.888',
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE 
    SET status = 'active', updated_at = NOW();

    -- 2. Gán quyền super_admin trong bảng public.user_roles
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (
        target_user_id,
        'super_admin',
        NOW()
    )
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Da gan thanh cong quyen super_admin cho user ID: %', target_user_id;
END $$;
