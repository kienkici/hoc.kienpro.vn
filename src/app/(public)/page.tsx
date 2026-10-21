import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  Play,
  CheckCircle2,
  Lock,
  Bot,
  Layers,
  ChevronRight,
  Star,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/CourseCard";
import { createClient } from "@/lib/supabase/server";
import { MOCK_COURSES } from "@/lib/mock-data";

export default async function HomePage() {
  const supabase = createClient();
  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null);

  const courses = (rawCourses && rawCourses.length > 0)
    ? rawCourses.map((c: any) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        subtitle: c.short_description || "",
        description: c.description || "",
        thumbnailUrl: c.thumbnail_url || "/images/course_preview.jpg",
        price: Number(c.original_price),
        salePrice: Number(c.sale_price),
        studentCount: c.studentCount || 1280,
        rating: 4.9,
        reviewCount: 342,
        highlights: c.highlights || [
          "Tự tay làm Website LMS & Landing Page cao cấp chỉ trong 3 ngày",
          "Tự động hóa thanh toán VietQR 0% phí giao dịch",
          "Bảo mật HLS mã hóa video chống tải xuống",
        ],
      }))
    : MOCK_COURSES;

  return (
    <div className="bg-black text-white overflow-hidden space-y-32 pb-32">
      {/* =========================================================================
          1. HERO SECTION (APPLE IPHONE PRO CINEMATIC STYLE)
      ========================================================================= */}
      <section className="relative pt-24 md:pt-36 pb-16 overflow-hidden">
        {/* Subtle radial ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-zinc-800/20 via-zinc-900/10 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#0071e3]/10 blur-[120px] pointer-events-none rounded-full" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-10 relative z-10">
          {/* Eyebrow Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-inner text-xs font-medium tracking-wider text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KIENPRO LMS PRO</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">THẾ HỆ ĐÀO TẠO AI MỚI</span>
          </div>

          {/* Statement Headlines (Apple SF Pro Display style) */}
          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-[1.05]">
              Thiết kế đẳng cấp.
            </h1>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-400 leading-[1.05]">
              Tự động hóa <span className="apple-headline">tuyệt đối.</span>
            </h2>
          </div>

          {/* Clean Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-[#86868b] max-w-2xl mx-auto font-normal leading-relaxed">
            Học thực chiến, làm chủ công nghệ AI và hệ thống kinh doanh tự động. Cấp quyền học tức thì trong 10 giây qua VietQR, bảo vệ bản quyền với video HLS mã hóa đa tầng.
          </p>

          {/* Apple Pill CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              asChild
              className="rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] text-sm font-semibold px-8 py-6 transition-all duration-300 shadow-[0_0_30px_rgba(0,113,227,0.45)] hover:scale-[1.02]"
            >
              <Link href="#courses">
                Khám phá khóa học <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-semibold px-8 py-6 backdrop-blur-md transition-all duration-300"
            >
              <Link href="/login">Đăng nhập học viên</Link>
            </Button>
          </div>

          {/* Floating Titanium Device Showcase */}
          <div className="pt-12 max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-white/15 via-white/5 to-transparent border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-950 border border-white/5">
                <Image
                  src="/images/hero_preview.jpg"
                  alt="Giao diện KIENPRO LMS Pro"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Floating Micro Pills */}
                <div className="absolute bottom-4 left-4 right-4 hidden sm:flex items-center justify-between text-xs font-medium text-white/90">
                  <div className="px-4 py-2 rounded-full apple-glass flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span>VietQR Tự Động • Kích hoạt 10 Giây</span>
                  </div>
                  <div className="px-4 py-2 rounded-full apple-glass flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Bảo Mật HLS Bunny Stream</span>
                  </div>
                  <div className="px-4 py-2 rounded-full apple-glass flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-[#2997ff]" />
                    <span>AI Trợ Lý Mentor 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. APPLE SPEC TICKER (TỔNG QUAN THÔNG SỐ VƯỢT TRỘI)
      ========================================================================= */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 border-y border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              10s
            </div>
            <p className="text-xs text-[#86868b] uppercase tracking-wider font-medium">
              Cấp học VietQR tự động
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              4K HLS
            </div>
            <p className="text-xs text-[#86868b] uppercase tracking-wider font-medium">
              Video bảo mật chống tải
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              100%
            </div>
            <p className="text-xs text-[#86868b] uppercase tracking-wider font-medium">
              Thực chiến tạo sản phẩm
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              4.9 ★
            </div>
            <p className="text-xs text-[#86868b] uppercase tracking-wider font-medium">
              Hài lòng từ 1.280+ học viên
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. BENTO GRID TÍNH NĂNG ĐỘT PHÁ (APPLE BENTO SHOWCASE)
      ========================================================================= */}
      <section className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            Đột Phá Kỹ Thuật
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Trải nghiệm học tập được tinh chỉnh tới từng chi tiết.
          </h2>
          <p className="text-[#86868b] text-base leading-relaxed">
            Mỗi tính năng trên KIENPRO LMS đều được xây dựng để mang lại sự mượt mà, tiện dụng và tối ưu thời gian tối đa cho bạn.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1 (Col-span 2) */}
          <div className="md:col-span-2 rounded-3xl p-8 sm:p-10 apple-glass-card hover:border-white/20 transition-all duration-500 flex flex-col justify-between space-y-8 relative overflow-hidden group">
            <div className="space-y-4 max-w-lg z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Thanh Toán Không Chờ Đợi
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Cấp tài khoản & khóa học tự động trong 10 giây.
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Quét mã VietQR trên bất kỳ ứng dụng ngân hàng nào. Webhook bảo mật xử lý giao dịch tức thời, gửi email kích hoạt và mở quyền vào phòng học ngay lập tức mà không cần xác nhận thủ công.
              </p>
            </div>

            <div className="relative pt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-6 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>0% phí trung gian</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Chống trùng lặp Anti-replay</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hỗ trợ mọi App Ngân Hàng</span>
              </div>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="rounded-3xl p-8 sm:p-10 apple-glass-card hover:border-white/20 transition-all duration-500 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Bảo Vệ Độc Quyền
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Video mã hóa Bunny HLS.
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Bảo mật chống tải xuống trái phép bằng công nghệ Token mã hóa động. Đường truyền CDN toàn cầu tốc độ cao, xem mượt mà không giật lag.
              </p>
            </div>
            <div className="text-xs text-zinc-500 pt-4 border-t border-white/[0.06]">
              Tự động điều chỉnh độ phân giải từ 720p đến 4K.
            </div>
          </div>

          {/* Bento Item 3 */}
          <div className="rounded-3xl p-8 sm:p-10 apple-glass-card hover:border-white/20 transition-all duration-500 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Học Cùng Trợ Lý
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                AI Mentor đồng hành 24/7.
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Giải đáp câu hỏi thực hành, hỗ trợ sửa code và gỡ lỗi ngay trong từng bài học. Không bao giờ lo bị tắc nghẽn khi tự học.
              </p>
            </div>
            <div className="text-xs text-zinc-500 pt-4 border-t border-white/[0.06]">
              Tích hợp trí tuệ nhân tạo thế hệ mới nhất.
            </div>
          </div>

          {/* Bento Item 4 (Col-span 2) */}
          <div className="md:col-span-2 rounded-3xl p-8 sm:p-10 apple-glass-card hover:border-white/20 transition-all duration-500 flex flex-col justify-between space-y-8 relative overflow-hidden group">
            <div className="space-y-4 max-w-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Giao Diện Tinh Giản
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Không gây xao nhãng. Tập trung 100% vào tiếp thu.
              </h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                Loại bỏ mọi banner rối mắt. Bố cục không gian đen trắng cao cấp giúp mắt bạn thoải mái khi học tập nhiều giờ liên tục trên Laptop, iPad hay iPhone.
              </p>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-white/[0.08] text-xs text-zinc-400">
              <span>Đồng bộ tiến độ theo thời gian thực</span>
              <span>•</span>
              <span>Ghi chú thông minh kèm timestamp</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. COURSE CATALOG (APPLE SHOWROOM PRODUCTS)
      ========================================================================= */}
      <section id="courses" className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
              Chương Trình Đào Tạo
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Các khóa học nổi bật.
            </h2>
            <p className="text-[#86868b] text-sm sm:text-base max-w-xl">
              Nội dung cô đọng, dễ hiểu ngay cả với người chưa từng có nền tảng công nghệ.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Award className="w-4 h-4 text-[#2997ff]" />
            <span>Cam kết hoàn tiền trong 7 ngày nếu không hài lòng</span>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course as any} />
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. PHILOSOPHY QUOTE SECTION (APPLE KEYNOTE MOMENT)
      ========================================================================= */}
      <section className="container max-w-5xl mx-auto px-4 sm:px-6 text-center py-16">
        <div className="rounded-3xl p-10 md:p-16 border border-white/10 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-black relative">
          <div className="space-y-6 max-w-3xl mx-auto">
            <p className="text-2xl sm:text-3xl md:text-4xl font-light text-zinc-200 leading-snug tracking-tight">
              &ldquo;Học công nghệ và tự động hóa không nên là điều phức tạp. Mọi thứ phải trực quan, chuẩn mực và đem lại kết quả thực tế ngay tức thì.&rdquo;
            </p>
            <div className="pt-4 flex flex-col items-center justify-center space-y-1">
              <span className="font-semibold text-white tracking-wide">Kiên Pro</span>
              <span className="text-xs text-[#86868b]">Founder & Lead Instructor • Thương hiệu Kiên Pro</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. CLOSING CTA BANNER (READY TO UPGRADE)
      ========================================================================= */}
      <section className="container max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
          Sẵn sàng bắt đầu?
        </h2>
        <p className="text-base sm:text-lg text-[#86868b] max-w-xl mx-auto leading-relaxed">
          Gia nhập cộng đồng hơn 1.200 học viên tại KIENPRO LMS. Sở hữu ngay các kỹ năng AI & Tự động hóa bán hàng dẫn đầu thị trường.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            asChild
            className="rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] text-sm font-semibold px-8 py-6 transition-all duration-300 shadow-[0_0_30px_rgba(0,113,227,0.45)] hover:scale-[1.02]"
          >
            <Link href="#courses">
              Đăng ký ngay bây giờ <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white text-sm font-semibold px-8 py-6 backdrop-blur-md"
          >
            <Link href="https://zalo.me/0909999888" target="_blank" rel="noopener noreferrer">
              Tư vấn trực tiếp qua Zalo
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

