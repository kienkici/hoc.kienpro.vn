# AGENTS.md - QUY NGUYÊN HOẠT ĐỘNG CHO CÁC AI AGENT
## DỰ ÁN: KIENPRO LMS (THƯƠNG HIỆU KIÊN PRO)

Tài liệu này quy định tất cả các nguyên tắc, chuẩn mực code và quy trình làm việc bắt buộc dành cho mọi AI Agent (Antigravity, Copilot, Codex, Claude, ChatGPT...) khi tham gia phát triển, bảo trì hoặc refactor codebase của dự án **KIENPRO LMS**.

---

## 1. NGUYÊN TẮC CỐT LÕI (CORE DIRECTIVES)

1. **Tuân thủ Thiết kế trong `00_Docs/`**:
   - Trước khi sửa hoặc thêm code, Agent BẮT BUỘC phải đọc các tài liệu tương ứng trong thư mục `00_Docs/` (`01_PRD.md`, `05_DATABASE_SCHEMA.md`, `06_API_WEBHOOK_SPEC.md`, `08_SECURITY_REQUIREMENTS.md`...).
   - Tuyệt đối không tự ý đổi tên cột trong DB, tên endpoint API hoặc quy trình nghiệp vụ đã được định nghĩa.

2. **TypeScript Strict Mode**:
   - Không bao giờ dùng `any`. Luôn định nghĩa Type/Interface rõ ràng trong `src/types/`.
   - Tất cả các payload API và form input phải validate qua **Zod**.

3. **Bảo mật là Ưu tiên Số 1**:
   - Không được ghi secret thật (API Keys, Passwords, Webhook Secrets) vào bất kỳ đâu trong codebase.
   - Không gửi mật khẩu văn bản thuần qua Email/SMS.
   - Mọi Server Action & API Route đòi hỏi quyền hạn phải gọi hàm helper kiểm tra Role ở Server-side (`requireRole`).
   - Luôn sử dụng RLS cho mọi bảng trong Supabase.

4. **Xử lý Webhook & Idempotency**:
   - Mọi logic nhận webhook thanh toán phải kiểm tra signature HMAC trước.
   - Luôn sử dụng tra cứu `(provider, transaction_id)` trên bảng `webhook_events` để đảm bảo chống xử lý trùng lặp giao dịch (Anti-replay).

5. **Thiết kế UI/UX Gold Premium**:
   - Tông màu chủ đạo: Đen (`#09090B`), Trắng (`#FFFFFF`), Gold (`#D4AF37`).
   - Sử dụng Tailwind CSS & Component từ `shadcn/ui`.
   - Ưu tiên sự tối giản, tốc độ tải và độ tiện dụng cho người dùng không rành công nghệ.

---

## 2. QUY CHUẨN CẤU TRÚC CODE (CODE STRUCTURE CONVENTIONS)

```text
src/
├── app/                  # Next.js App Router Pages & API Routes
│   ├── (auth)/           # Routes xác thực (login, activate, reset-password)
│   ├── (public)/         # Routes công khai (landing page, catalog, checkout)
│   ├── (student)/        # Portal dành cho Học viên (/dashboard, /learn)
│   ├── admin/            # Portal dành cho Quản trị viên (/admin)
│   └── api/              # API Routes (checkout, webhooks, progress)
├── components/           # UI Components
│   ├── ui/               # Component cơ bản từ shadcn/ui (button, dialog, card)
│   ├── shared/           # Component dùng chung (Navbar, Footer, Header)
│   ├── student/          # Component học tập (VideoPlayer, LessonList, NoteEditor)
│   └── admin/            # Component quản trị (DataTable, CourseForm)
├── lib/                  # Utilities & Third-party integrations
│   ├── supabase/         # Supabase client & server instances
│   ├── resend/           # Resend email templates & helpers
│   ├── bunny/            # Bunny Stream video client
│   └── auth/             # Permission guards & RBAC helpers
├── types/                # TypeScript Interfaces & Types
│   ├── database.ts       # Supabase auto-generated database types
│   ├── auth.ts           # User, Role, Session types
│   └── order.ts          # Order, Payment, Webhook types
└── server/               # Server Actions
    ├── actions/          # Next.js Server Actions (checkout, course, profile)
    └── validators/       # Zod schemas (checkoutSchema, courseSchema)
```

---

## 3. THỦ TỤC XÁC MINH TRƯỚC KHI BÀN GIAO CODE (VERIFICATION CHECKLIST)

Mỗi khi Agent tạo hoặc cập nhật code, Agent phải đảm bảo:
- [ ] Code không bị lỗi TypeScript typecheck (`npm run typecheck`).
- [ ] Không vô tình comment out các đoạn code test hoặc validation.
- [ ] Đã bổ sung Unit Test (Vitest) cho các hàm logic phức tạp mới thêm vào.
- [ ] Đã cập nhật tài liệu trong `00_Docs/` nếu có thay đổi về mặt kiến trúc.
