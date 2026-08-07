-- =============================================================================
-- KIENPRO LMS - CẤU HÌNH BẢO MẬT RLS CHO SUPABASE STORAGE (BUCKET: MEDIA)
-- =============================================================================

-- 1. Cho phép đọc công khai (để hiển thị hình ảnh trên website học viên/checkout)
CREATE POLICY "Allow public read access on media bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- 2. Cho phép người dùng đã đăng nhập (Admin/Instructor) tải tệp lên
CREATE POLICY "Allow authenticated insert access on media bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 3. Cho phép người dùng đã đăng nhập (Admin/Instructor) cập nhật tệp
CREATE POLICY "Allow authenticated update access on media bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- 4. Cho phép người dùng đã đăng nhập (Admin/Instructor) xóa tệp
CREATE POLICY "Allow authenticated delete access on media bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
