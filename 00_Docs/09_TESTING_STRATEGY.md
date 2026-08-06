# CHIẾN LƯỢC KÍỂM THỬ HỆ THỐNG (TESTING STRATEGY SPECIFICATION)
## DỰ ÁN: KIENPRO LMS

---

## 1. TỔNG QUAN HẠ TẦNG KIỂM THỬ (TESTING INFRASTRUCTURE)

Để đảm bảo tính ổn định tuyệt đối cho hệ thống **KIENPRO LMS**, đặc biệt là quy trình thanh toán và cấp tài khoản tự động, hệ thống sử dụng kết hợp 2 framework kiểm thử chuẩn mực:

1. **Vitest**: Đảm nhận kiểm thử đơn vị (**Unit Testing**) và kiểm thử tích hợp API/Server Actions (**Integration Testing**).
2. **Playwright**: Đảm nhận kiểm thử giao diện và kịch bản người dùng đầu-cuối (**End-to-End Testing - E2E**).

---

## 2. UNIT & INTEGRATION TESTING (VITEST)

### 2.1 Cấu hình & Môi trường
- Viết test trong thư mục `tests/unit/`.
- Mock các dịch vụ bên thứ 3 (Resend Email API, SePay Webhook, Bunny Stream).

### 2.2 Danh mục các TestCase Cốt lõi
- **Test Checkout Validation (`checkout.test.ts`)**:
  - Test Zod Schema với email không hợp lệ -> Phải quăng lỗi `INVALID_EMAIL`.
  - Test tính đúng đắn của số tiền và mã đơn hàng sinh ra (`KPxxxxx`).
- **Test Webhook Idempotency (`webhook_idempotency.test.ts`)**:
  - Gửi 2 request webhook giống hệt nhau có cùng `transaction_id`.
  - Request 1: Phải xử lý cấp khóa học và cập nhật order `PAID`.
  - Request 2: Phải nhận diện trùng lặp, bỏ qua cấp khóa học và trả HTTP 200 `Ignored`.
- **Test Verification Token Expiry (`activation_token.test.ts`)**:
  - Test token tạo từ 73 giờ trước -> Trả về `EXPIRED_TOKEN`.
  - Test token đã dùng `used_at != null` -> Trả về `ALREADY_USED`.
- **Test Role Permission Guards (`rbac_guards.test.ts`)**:
  - Test user role `student` gọi hàm `requireRole(['super_admin'])` -> Phải ném ngoại lệ `FORBIDDEN`.

---

## 3. END-TO-END TESTING (PLAYWRIGHT)

### 3.1 Cấu hình & Môi trường
- Viết test trong thư mục `tests/e2e/`.
- Chạy kiểm thử đa trình duyệt: Chromium (Desktop Chrome), Firefox, WebKit (Safari) và Mobile Chrome (Emulation).

### 3.2 Luồng Test Kịch bản Người dùng (E2E User Flow)

```typescript
// tests/e2e/student_checkout_activation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Luồng Đăng ký Mua khóa học & Kích hoạt Tài khoản', () => {
  test('Học viên mua khóa học qua VietQR và đặt mật khẩu lần đầu thành công', async ({ page }) => {
    // 1. Vào trang chi tiết khóa học
    await page.goto('/courses/thiet-ke-website-ai');
    await expect(page.locator('h1')).toContainText('Khóa học Thiết kế Website AI');

    // 2. Click Mua ngay & Điền form
    await page.click('button:has-text("Đăng ký ngay")');
    await page.fill('input[name="customerName"]', 'Học Viên Test');
    await page.fill('input[name="customerEmail"]', 'test.student@example.com');
    await page.fill('input[name="customerPhone"]', '0912345678');
    await page.click('button[type="submit"]');

    // 3. Màn hình thanh toán hiển thị QR Code & Mã đơn hàng
    await expect(page.locator('.qr-code-container')).toBeVisible();
    const orderCode = await page.locator('.order-code-text').textContent();

    // 4. Giả lập gửi Webhook thanh toán thành công
    // ... gọi API trigger webhook test ...

    // 5. Màn hình tự động thông báo thành công
    await expect(page.locator('text=Thanh toán thành công')).toBeVisible({ timeout: 10000 });
  });
});
```

---

## 4. QUY TRÌNH CHẠY TEST TRONG CI/CD (VERCEL / GITHUB ACTIONS)

- Mỗi Pull Request hoặc Commit lên nhánh `main` phải vượt qua:
  1. `npm run typecheck` (Kiểm tra TypeScript strict mode).
  2. `npm run test:unit` (Chạy toàn bộ Vitest unit tests).
  3. `npm run test:e2e` (Chạy Playwright tests trên môi trường preview).
