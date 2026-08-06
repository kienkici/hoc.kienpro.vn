# HƯỚNG DẪN THIẾT KẾ GIAO DIỆN & TRẢI NGHIỆM NGUỜI DÙNG (UI/UX DESIGN GUIDELINES)
## DỰ ÁN: KIENPRO LMS (THƯƠNG HIỆU KIÊN PRO)

---

## 1. PHONG CÁCH THIẾT KẾ TỔNG QUAN (DESIGN PHILOSOPHY)

**KIENPRO LMS** mang phong cách **Premium Minimalist** (Tối giản cao cấp), hướng tới sự thanh lịch, sang trọng và chuyên nghiệp.

- **Đơn giản & Dễ sử dụng**: Tối ưu tuyệt đối cho đối tượng học viên không rành công nghệ. Luồng thao tác không quá 2 click.
- **Không lạm dụng hiệu ứng**: Tránh các hiệu ứng chuyển động phức tạp làm xao nhãng việc học hoặc làm chậm tốc độ tải trang.
- **Tập trung vào nội dung bài giảng**: Video và tài liệu bài học là trung tâm của màn hình.

---

## 2. BẢNG MÀU CHUẨN HÓA (COLOR PALETTE SYSTEM)

Màu sắc chủ đạo dựa trên bộ ba: **Đen (Background/Depth) - Trắng (Text/Readability) - Vàng Gold (Brand Accent & Luxury)**.

```css
/* Color Tokens (Tailwind CSS Variables) */
:root {
  /* Brand Accent Gold */
  --gold-primary: #D4AF37;       /* Gold cổ điển sang trọng */
  --gold-hover: #C5A028;         /* Gold đậm khi hover */
  --gold-light: #F4E8C1;         /* Gold nhạt cho badge, highlight */
  --gold-gradient: linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #997A15 100%);

  /* Neutral Dark Theme Backgrounds */
  --bg-dark-base: #09090B;       /* Zinc 950 - Nền chính dark mode */
  --bg-dark-surface: #18181B;    /* Zinc 900 - Card/Container background */
  --bg-dark-border: #27272A;     /* Zinc 800 - Đường viền phân cách */

  /* Neutral Light Theme (Nếu chọn Light Mode) */
  --bg-light-base: #FAFAFA;      /* Background sáng nhẹ dịu mắt */
  --bg-light-surface: #FFFFFF;
  --bg-light-border: #E4E4E7;

  /* Typography Colors */
  --text-primary-dark: #FFFFFF;
  --text-secondary-dark: #A1A1AA; /* Zinc 400 */
  --text-primary-light: #09090B;
  --text-secondary-light: #71717A;
}
```

---

## 3. NGUYÊN TẮC QUY CHUẨN PHÔNG CHỮ (TYPOGRAPHY)

- **Primary Font**: `Inter` hoặc `Outfit` (Google Fonts) - Phông sans-serif hiện đại, độ đọc cực cao trên cả thiết bị di động lẫn máy tính.
- **Heading Scale**:
  - `H1`: 36px / Mobile: 28px (Bold 700 - Dùng cho Tiêu đề khóa học, Landing page)
  - `H2`: 28px / Mobile: 22px (SemiBold 600 - Tiêu đề Chương/Module)
  - `H3`: 20px / Mobile: 18px (Medium 500 - Tiêu đề Bài học)
  - `Body`: 16px (Regular 400 - Nội dung bài học, mô tả)
  - `Caption`: 14px / 12px (Regular 400 - Ghi chú, thời lượng video)

---

## 4. QUY CHUẨN COMPONENT (SHADCN/UI CUSTOMIZATION)

### 4.1 Nút bấm (Buttons)
- **Primary Button (Nút Mua hàng / Kích hoạt / Đăng nhập)**:
  - Background: Gold Gradient (`--gold-gradient`) hoặc màu `--gold-primary`.
  - Chữ: Màu Đen (`#000000`), Font Weight Bold (600).
  - Hover: Tăng độ sáng nhẹ, hiệu ứng `transition-all duration-200`.
- **Secondary Button (Nút Học thử / Hủy)**:
  - Viền (Border): 1px `--bg-dark-border`.
  - Background: Transparent hoặc Dark Surface.
  - Chữ: Trắng / Secondary Gray.

### 4.2 Card Khóa học (Course Card)
- Viền mảnh `1px solid #27272A`.
- Thumbnail hình ảnh tỉ lệ `16:9` chuẩn sắc nét.
- Badge giá tiền nổi bật màu Gold.
- Không dùng bóng mờ đổ quá đậm (Avoid heavy drop-shadows).

### 4.3 Trình phát Video Học tập (Learning Player Layout)
- Trình phát Video chiếm **75% màn hình** trên Desktop (Cột trái).
- Danh sách Chương/Bài học xếp dạng Accordion ở **Cột phải (25%)**.
- Nút *"Bài tiếp theo"* và *"Bài trước đó"* đặt cố định ở góc dưới thanh điều hướng video để học viên thao tác liên tục mà không cần cuộn trang.

---

## 5. ĐÁP ỨNG THIẾT BỊ DỊ ĐỘNG (MOBILE & TABLET RESPONSIVENESS)

- **Mobile First Navigation**:
  - Khi xem bài học trên điện thoại, danh sách bài học thu gọn vào Bottom Sheet hoặc Drawer kéo từ phải sang.
  - Video tự động vừa vặn màn hình ngang/dọc (Aspect ratio 16:9).
- **Kích thước vùng chạm (Touch Target Size)**:
  - Tối thiểu `44px x 44px` cho tất cả các nút bấm trên giao diện di động để người lớn tuổi hoặc người không quen thao tác không bấm nhầm.
