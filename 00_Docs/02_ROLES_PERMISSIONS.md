# QUY ĐỊNH PHÂN QUYỀN NGUỜI DÙNG (USER ROLES & PERMISSIONS)
## DỰ ÁN: KIENPRO LMS

---

## 1. TỔNG QUAN HỆ THỐNG PHÂN QUYỀN (RBAC)

Hệ thống **KIENPRO LMS** áp dụng mô hình phân quyền dựa trên vai trò (**Role-Based Access Control - RBAC**) kết hợp với chính sách bảo mật cấp dòng dữ liệu (**Row Level Security - RLS**) của PostgreSQL/Supabase.

Tất cả các quyền truy cập (Create, Read, Update, Delete) phải được kiểm tra trực tiếp ở **Server-Side** (Next.js Server Actions / API Routes / Middleware) và **Database Level** (Supabase RLS Policies). Tuyệt đối **không chỉ ẩn nút trên giao diện Client** để phân quyền.

---

## 2. DƠM MỤC CÁC VAI TRÒ (ROLES)

Hệ thống định nghĩa 4 vai trò chính thông qua bảng `roles`:

| Mã Vai Trò (Role Code) | Tên Vai Trò | Mô Tả Trách Nhiệm |
| :--- | :--- | :--- |
| `super_admin` | Quản trị viên tối cao | Toàn quyền kiểm soát hệ thống, phân quyền người dùng, cấu hình thanh toán, quản lý tài chính, xem Audit Logs. |
| `instructor` | Giảng viên | Quản lý nội dung các khóa học được phân công (tạo bài học, tải video, chỉnh sửa lộ trình học, xem tiến độ học viên trong khóa học của mình). |
| `support` | Nhân viên Hỗ trợ (CSKH) | Tra cứu đơn hàng, hỗ trợ học viên bị lỗi kích hoạt, gửi lại email kích hoạt, kích hoạt khóa học thủ công khi có bằng chứng thanh toán. Không có quyền sửa nội dung bài học hoặc xóa dữ liệu hệ thống. |
| `student` | Học viên | Truy cập vào các khóa học đã đăng ký/thanh toán hợp lệ, xem bài học, tải tài liệu, đánh dấu tiến độ, ghi chú bài học, quản lý cá nhân. |

---

## 3. BẢNG MA TRẬN ĐẶC QUYỀN (PERMISSION MATRIX)

| Tính Năng / Thao Tác | Super Admin | Instructor | Support | Student |
| :--- | :---: | :---: | :---: | :---: |
| **Hệ thống & Cấu hình** | | | | |
| Quản lý Cấu hình Hệ thống & Webhook Keys | ✅ | ❌ | ❌ | ❌ |
| Xem Log hệ thống (Audit Logs) | ✅ | ❌ | ❌ | ❌ |
| Phân quyền & Đổi Role cho người dùng | ✅ | ❌ | ❌ | ❌ |
| **Quản lý Khóa học & Nội dung** | | | | |
| Tạo / Xóa Khóa học | ✅ | ❌ | ❌ | ❌ |
| Chỉnh sửa thông tin Khóa học (Tài liệu, Học phí, Xuất bản) | ✅ | ✅ (Khóa được gán) | ❌ | ❌ |
| Tạo / Sửa / Xóa Module & Bài học (Lessons) | ✅ | ✅ (Khóa được gán) | ❌ | ❌ |
| Tải video (Bunny/Cloudflare Stream) & Resource | ✅ | ✅ (Khóa được gán) | ❌ | ❌ |
| Xem danh sách Khóa học công khai (Public Catalog) | ✅ | ✅ | ✅ | ✅ |
| Truy cập nội dung bài giảng chi tiết | ✅ | ✅ (Khóa của mình) | ❌ | ✅ (Khóa đã mua) |
| **Quản lý Đơn hàng & Thanh toán** | | | | |
| Xem danh sách toàn bộ Đơn hàng & Thanh toán | ✅ | ❌ | ✅ | ❌ |
| Tra cứu Đơn hàng theo Email / Mã chuyển khoản | ✅ | ❌ | ✅ | ✅ (Đơn của mình) |
| Kích hoạt khóa học thủ công (Manual Enrollment) | ✅ | ❌ | ✅ (Ghi log) | ❌ |
| Hủy đơn hàng / Hoàn tiền (Refund) | ✅ | ❌ | ❌ | ❌ |
| Xử lý sự cố Webhook bị treo | ✅ | ❌ | ✅ | ❌ |
| **Quản lý Học viên & Tiến độ** | | | | |
| Xem danh sách Học viên hệ thống | ✅ | ❌ | ✅ | ❌ |
| Xem Báo cáo Tiến độ Học tập của Học viên | ✅ | ✅ (Trong khóa học) | ✅ | ✅ (Bản thân) |
| Reset Mật khẩu / Gửi lại Email kích hoạt | ✅ | ❌ | ✅ | ❌ |
| Khóa / Bật tài khoản Học viên | ✅ | ❌ | ❌ | ❌ |
| Ghi chú cá nhân bài học (Notes) | ❌ | ❌ | ❌ | ✅ (Bản thân) |

---

## 4. QUY NGUYÊN KIỂM TRA QUYỀN (SERVER-SIDE AUTHORIZATION STRATEGY)

### 4.1 Áp dụng Helper Function kiểm tra Role ở Server
Mọi Server Action và API Route đòi hỏi quyền hạn cao phải gọi hàm xác thực chuẩn:

```typescript
// src/lib/auth/guards.ts
import { createClient } from '@/lib/supabase/server';
import { UserRole } from '@/types/auth';

export async function requireRole(allowedRoles: UserRole[]) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('UNAUTHORIZED: Bạn chưa đăng nhập');
  }

  // Lấy role từ bảng profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role:roles(code)')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role?.code as UserRole;

  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error('FORBIDDEN: Bạn không có quyền thực hiện thao tác này');
  }

  return { user, userRole };
}
```

### 4.2 Bảo vệ Route bằng Middleware (Next.js Middleware)
Tất cả các tuyến đường `/admin/*` phải được bảo vệ bởi Next.js Middleware:
- Nếu chưa đăng nhập -> Redirect về `/login`.
- Nếu role là `student` cố truy cập `/admin/*` -> Redirect về `/dashboard` kèm thông báo lỗi.

---

## 5. YÊU CẦU GHI NHẬT KÝ HOẠT ĐỘNG (AUDIT LOGGING)

Mọi thao tác thay đổi dữ liệu nhạy cảm hoặc cấp quyền thủ công của `super_admin` và `support` BẮT BUỘC phải tạo 1 bản ghi vào bảng `audit_logs`:
- **Thao tác phải ghi log**:
  - Kích hoạt khóa học thủ công cho học viên.
  - Thu hồi quyền truy cập khóa học.
  - Thay đổi vai trò người dùng (Ví dụ: Đổi Student thành Support).
  - Gửi lại Email kích hoạt tài khoản.
  - Thay đổi giá khóa học hoặc trạng thái xuất bản khóa học.
  - Khóa hoặc mở khóa tài khoản người dùng.

- **Nội dung bản ghi Audit Log**:
  - `actor_id`: UUID người thực hiện.
  - `action`: Mã thao tác (vd: `MANUAL_ENROLLMENT_CREATE`, `USER_ROLE_UPDATE`).
  - `target_type` & `target_id`: Đối tượng bị tác động (vd: `user`, `order`, `course`).
  - `old_values` & `new_values`: JSON chứa giá trị trước và sau khi đổi.
  - `ip_address` & `user_agent`: Thông tin truy cập.
