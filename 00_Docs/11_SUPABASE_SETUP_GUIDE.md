# HƯỚNG DẪN CẤU HÌNH & THIẾT LẬP SUPABASE - KIENPRO LMS

Tài liệu này hướng dẫn chi tiết các bước thiết lập cơ sở dữ liệu **Supabase**, chạy các bản migration, seed dữ liệu mẫu, và kích hoạt quyền **Super Admin** đầu tiên để chạy ứng dụng ở môi trường local.

---

## 1. Hướng Dẫn Tạo Project Supabase & Lấy API Keys

### Bước 1: Tạo dự án mới
1. Truy cập [Supabase Dashboard](https://supabase.com/dashboard) và đăng nhập bằng tài khoản của bạn.
2. Nhấp vào **New Project** và chọn Tổ chức (Organization) của bạn.
3. Nhập các thông tin sau:
   - **Name**: `KIENPRO LMS`
   - **Database Password**: Nhập mật khẩu bảo mật cao (hãy lưu lại mật khẩu này).
   - **Region**: Chọn vùng gần nhất (ví dụ: `Singapore` hoặc `Southeast Asia`).
4. Nhấp vào **Create new project** và chờ vài phút để Supabase khởi tạo hạ tầng cơ sở dữ liệu.

### Bước 2: Lấy các biến môi trường
1. Khi project đã được tạo xong, truy cập vào menu **Project Settings** (biểu tượng bánh răng ở góc dưới bên trái).
2. Chọn mục **API**.
3. Sao chép các thông tin sau:
   - **Project URL**: Đây chính là URL của dự án.
   - **anon / public key**: Khóa công khai dùng cho phía client.
   - **service_role key**: Khóa có quyền tối cao (chỉ dùng ở server, không lộ ra client).

---

## 2. Cấu Hình File `.env.local`

Tạo một file có tên `.env.local` ở thư mục gốc của dự án (ngang hàng với `.env.example`) và điền các giá trị bạn vừa lấy được:

```env
# 1. APP CONFIGURATION
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="KIENPRO LMS"

# 2. SUPABASE CONFIGURATION
NEXT_PUBLIC_SUPABASE_URL="<ĐIỀN_PROJECT_URL_CỦA_BẠN>"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<ĐIỀN_ANON_KEY_CỦA_BẠN>"
SUPABASE_SERVICE_ROLE_KEY="<ĐIỀN_SERVICE_ROLE_KEY_CỦA_BẠN>"
```

> [!WARNING]
> Không commit file `.env.local` lên Git. File này đã được thêm vào `.gitignore` để tránh rò rỉ thông tin bảo mật.

---

## 3. Chạy Bản Migration Khởi Tạo Database

Vì dự án chưa thiết lập Supabase CLI kết nối tự động, bạn sẽ chạy migration trực tiếp thông qua **SQL Editor** trên giao diện web của Supabase:

1. Trong trang quản lý dự án Supabase, chọn mục **SQL Editor** từ thanh menu bên trái.
2. Nhấp vào **New query**.
3. Mở file [20260802000000_init.sql](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/supabase/migrations/20260802000000_init.sql), sao chép toàn bộ nội dung SQL trong file này.
4. Dán nội dung đó vào khung soạn thảo của SQL Editor trên Supabase.
5. Nhấp vào nút **Run** ở góc dưới bên phải.
6. Xác nhận kết quả hiển thị thông báo `Success` (Đã khởi tạo thành công 18 bảng, các chỉ mục và chính sách bảo mật RLS).

---

## 4. Chạy Script Seed Dữ Liệu Phát Triển

Tiếp tục nạp dữ liệu mẫu cho khóa học và các bài học:

1. Trong **SQL Editor** của Supabase, tạo một **New query** mới.
2. Mở file [seed.sql](file:///d:/Thi%E1%BA%BF%20k%E1%BA%BF%20Website/supabase/seed.sql) và sao chép toàn bộ nội dung SQL.
3. Dán nội dung SQL vào khung soạn thảo và nhấp **Run**.
4. Toàn bộ cấu trúc khóa học mẫu, 3 chương và 6 bài giảng mẫu sẽ được đưa vào cơ sở dữ liệu.

---

## 5. Đăng Ký Tài Khoản & Gán Quyền Super Admin Đầu Tiên

Hệ thống bảo vệ phân quyền chặt chẽ thông qua bảng `user_roles`. Để truy cập được vào `/admin`, bạn cần tự tạo tài khoản và gán role cho mình:

### Bước 1: Đăng ký tài khoản Auth
1. Khởi chạy ứng dụng local bằng lệnh: `npm run dev`
2. Mở trình duyệt truy cập vào trang đăng ký hoặc bạn có thể tạo thủ công trực tiếp từ Supabase:
   - Vào mục **Authentication** trên thanh menu bên trái Supabase.
   - Nhấp **Add user** -> **Create user**.
   - Nhập Email và Mật khẩu cho tài khoản admin của bạn, sau đó nhấp **Auto-confirm user** (để tự kích hoạt không cần qua email).
   - Nhấp **Save**.

### Bước 2: Lấy User ID (UUID)
Sao chép mã UUID của tài khoản vừa tạo (ví dụ: `8a12b345-c67d-890e-f123-456789abcdef`).

### Bước 3: Chạy SQL gán quyền Super Admin
Vào **SQL Editor** trên Supabase, tạo truy vấn mới và chạy đoạn code sau (thay thế UUID tương ứng của bạn):

```sql
-- 1. Thêm thông tin hồ sơ người dùng
INSERT INTO public.profiles (id, full_name, phone, status, created_at, updated_at)
VALUES (
    '<MÃ_UUID_CỦA_BẠN>', 
    'Kiên Pro Admin', 
    '0909999888', 
    'active', 
    NOW(), 
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 2. Gán quyền tối cao Super Admin
INSERT INTO public.user_roles (user_id, role, created_at)
VALUES (
    '<MÃ_UUID_CỦA_BẠN>', 
    'super_admin', 
    NOW()
)
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 6. Cách Kiểm Tra Bảo Mật RLS (Row Level Security)

Để kiểm tra xem chính sách RLS có hoạt động tốt không:
1. Đăng nhập bằng tài khoản Student mẫu hoặc tài khoản không có quyền.
2. Thử truy cập trực tiếp vào `/admin/courses` hoặc gọi API. Bạn sẽ bị Next.js Middleware chặn lại hoặc Supabase trả về kết quả rỗng do chính sách RLS chặn quyền đọc.
3. Mọi truy vấn liên quan đến ghi nhận tiến độ (`lesson_progress`) chỉ cho phép học viên thao tác trên dữ liệu của chính mình (`auth.uid() = user_id`).

---

## 7. Khắc Phục Các Lỗi Thường Gặp

### Lỗi 1: `SUPABASE_SERVICE_ROLE_KEY is missing`
- **Nguyên nhân**: File `.env.local` chưa được cấu hình hoặc biến môi trường bị ghi sai tên.
- **Giải pháp**: Kiểm tra lại tên biến và đảm bảo đã khởi động lại server Next.js sau khi sửa file `.env.local`.

### Lỗi 2: `permission denied for table ...`
- **Nguyên nhân**: Bảng đã bật RLS nhưng chưa thiết lập chính sách cho vai trò tương ứng hoặc token phiên đăng nhập bị hết hạn.
- **Giải pháp**: Đảm bảo chính sách SELECT/INSERT/UPDATE đã được áp dụng trong migration. Bạn có thể kiểm tra danh sách policy hiện tại của bảng qua mục **Database** -> **Policies** trên Supabase.
