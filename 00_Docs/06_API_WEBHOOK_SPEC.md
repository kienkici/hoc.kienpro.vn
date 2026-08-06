# CHUẨN KẾT NỐI API & XỬ LÝ WEBHOOK THANH TOÁN (API & WEBHOOK SPECIFICATION)
## DỰ ÁN: KIENPRO LMS

---

## 1. NGUYÊN TẮC THIẾT KẾ API

- **Định dạng**: JSON (Content-Type: `application/json`).
- **Xác thực**: Supabase JWT Token trong Header (`Authorization: Bearer <token>`).
- **Validation**: TẤT CẢ dữ liệu đầu vào (Request Body & Query Params) đều phải qua Zod Schema Validation.
- **Trả lỗi chuẩn hóa**: Trả về đúng HTTP Status Code kèm format JSON:
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_TOKEN",
      "message": "Liên kết kích hoạt đã hết hạn hoặc không tồn tại"
    }
  }
  ```

---

## 2. DANH MỤC API ENDPOINTS CỐT LÕI

### 2.1 Public & Checkout APIs

#### `POST /api/checkout`
- **Mục đích**: Học viên gửi thông tin đăng ký mua khóa học và tạo đơn hàng.
- **Request Body**:
  ```json
  {
    "courseId": "uuid-v4-string",
    "customerName": "Nguyễn Văn A",
    "customerEmail": "nguyenvana@gmail.com",
    "customerPhone": "0987654321"
  }
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "orderCode": "KP98241",
      "totalAmount": 1500000,
      "qrCodeUrl": "https://img.vietqr.io/image/techcombank-123456789-compact2.png?amount=1500000&addInfo=KP98241&accountName=KIEN%20PRO",
      "expiresAt": "2026-08-02T23:15:00Z"
    }
  }
  ```

#### `GET /api/orders/status?orderCode=KP98241`
- **Mục đích**: Client Polling hoặc hiển thị trạng thái đơn hàng thời gian thực.
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "orderCode": "KP98241",
      "status": "PAID" // 'PENDING' | 'PAID' | 'EXPIRED'
    }
  }
  ```

---

### 2.2 Activation & Auth APIs

#### `POST /api/auth/verify-token`
- **Mục đích**: Xác minh tính hợp lệ của token kích hoạt trước khi mở form đặt mật khẩu.
- **Request Body**: `{ "token": "string-uuid" }`
- **Response**: `{ "success": true, "email": "nguyenvana@gmail.com" }`

#### `POST /api/auth/activate-password`
- **Mục đích**: Đặt mật khẩu lần đầu và hoàn tất kích hoạt tài khoản.
- **Request Body**:
  ```json
  {
    "token": "string-uuid",
    "password": "SecurePassword123!"
  }
  ```
- **Response Success**: `{ "success": true, "message": "Kích hoạt tài khoản thành công" }`

---

### 2.3 Student Learning APIs

#### `POST /api/lessons/progress`
- **Mục đích**: Cập nhật tiến độ xem video bài học.
- **Request Body**:
  ```json
  {
    "lessonId": "uuid-v4",
    "lastWatchedSecond": 420,
    "isCompleted": true
  }
  ```

#### `POST /api/notes`
- **Mục đích**: Tạo hoặc cập nhật ghi chú bài học.
- **Request Body**:
  ```json
  {
    "lessonId": "uuid-v4",
    "timestampSeconds": 180,
    "content": "Ý chính trong bài giảng: Khái niệm RLS trong PostgreSQL"
  }
  ```

---

## 3. CHUẨN XỬ LÝ WEBHOOK THANH TOÁN TỰ ĐỘNG (SEPAY / PAYOS / CASSO)

### 3.1 Webhook Endpoint Path
`POST /api/webhooks/payment`

### 3.2 Quy trình 5 Bước Kiểm tra & Xử lý An toàn

```
[Incoming Webhook Request]
         │
         ▼
 1. Verification Header Secret / HMAC Signature
         │
         ├───► Invalid Signature ──► Return 401 Unauthorized
         ▼
 2. Parse Payload & Check Idempotency Key (provider + transaction_id)
         │
         ├───► Already Processed ──► Return 200 OK {"message": "Ignored - Duplicate"}
         ▼
 3. Database Transaction & Unique Lock
         │ Insert record to `webhook_events` (STATUS: PROCESSING)
         ▼
 4. Match Order Code & Verify Amount
         │ Extract "KP98241" from content, verify amount >= order.total_amount
         │ Update `orders.status = 'PAID'`
         │ Create `payments` record
         ▼
 5. Auto Provisioning & Trigger Email
         │ Create Profile (if not exist)
         │ Create Enrollment
         │ Create Activation Token & Send Resend Email
         │ Update `webhook_events` (STATUS: SUCCESS)
         ▼
     Return 200 OK {"success": true}
```

### 3.3 Mẫu Webhook Payload (SePay Example)
```json
{
  "id": 982415,
  "gateway": "Techcombank",
  "transactionDate": "2026-08-02 22:55:00",
  "accountNumber": "190382910291",
  "code": null,
  "content": "Chuyen tien hoc phi don hang KP98241",
  "transferType": "in",
  "transferAmount": 1500000,
  "accumulated": 50000000,
  "subAccount": null,
  "referenceCode": "FT2621498124"
}
```

### 3.4 Quy tắc Bảo mật Webhook
1. **Không ghi thông tin ngân hàng nhạy cảm vào Server Logs**: Tuyệt đối xóa hoặc ẩn số tài khoản, số dư khả dụng trước khi log ra môi trường Vercel Logs.
2. **Luôn trả về HTTP 200 OK với Webhook bị trùng**: Giúp nhà cung cấp webhook không thử lại (retry) liên tục làm nghẽn hạ tầng.
3. **Sử dụng Timeout hợp lý**: Nếu quá trình gửi Email Resend bị chậm, thực hiện gửi async (background execution) để Webhook Endpoint phản hồi về SePay/PayOS trong dưới **2 giây**.
