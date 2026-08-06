import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, Award, ArrowRight, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/CourseCard";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null);

  const courses = (rawCourses || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.short_description || "",
    description: c.description || "",
    thumbnailUrl: c.thumbnail_url || "",
    price: Number(c.original_price),
    salePrice: Number(c.sale_price),
    studentCount: c.studentCount || 1280, // Fallback mock student count
    rating: 4.9,
    reviewCount: 342,
    highlights: c.highlights || [
      "Tự tay làm Website LMS & Landing Page cao cấp chỉ trong 3 ngày",
      "Tự động hóa thanh toán VietQR 0% phí giao dịch",
      "Bảo mật HLS mã hóa video chống tải xuống",
    ],
  }));

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 overflow-hidden border-b border-zinc-800/80 bg-gradient-to-b from-zinc-950 via-zinc-900/40 to-zinc-950">
        <div className="container max-w-7xl mx-auto px-4 text-center space-y-8 relative z-10">
          <Badge variant="gold" className="px-4 py-1.5 text-xs tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Nền Tảng Đào Tạo Kỹ Năng & AI Hàng Đầu
          </Badge>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Xây Dựng Sự Nghiệp & Tự Động Hóa Bán Hàng Với <span className="text-gold-gradient">Kiên Pro</span>
          </h1>

          <p className="text-base md:text-lg text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Học thực chiến, sở hữu kỹ năng đỉnh cao. Hệ thống cấp khóa học tự động 100% trong 10 giây qua VietQR Ngân hàng.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="gold" asChild className="w-full sm:w-auto text-base">
              <Link href="#courses">
                Khám Phá Khóa Học <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-base">
              <Link href="/login">
                Đăng Nhập Học Viên
              </Link>
            </Button>
          </div>

          {/* Key Value Proposition Badges */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center gap-3">
              <Zap className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Cấp Học 10 Giây</h4>
                <p className="text-[11px] text-zinc-400">VietQR Webhook tự động</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Bảo Mật Video HLS</h4>
                <p className="text-[11px] text-zinc-400">Mã hóa Bunny Stream</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center gap-3">
              <Award className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Chất Lượng Gold</h4>
                <p className="text-[11px] text-zinc-400">Kiến thức thực chiến 100%</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-gold-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-white">Hỗ Trợ AI Mentor</h4>
                <p className="text-[11px] text-zinc-400">Trợ lý học tập 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG KHÓA HỌC NỔI BẬT */}
      <section id="courses" className="container max-w-7xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Danh Mục Khóa Học Nổi Bật
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Các chương trình đào tạo thực chiến được thiết kế tỉ mỉ giúp bạn làm chủ công nghệ & kinh doanh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course as any} />
          ))}
        </div>
      </section>

      {/* TẠI SAO CHỌN KIÊN PRO */}
      <section className="container max-w-7xl mx-auto px-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <Badge variant="gold">GIẢI PHÁP ĐÁNG TIN CẬY</Badge>
            <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">
              Tại sao hàng ngàn học viên lựa chọn KIENPRO LMS?
            </h3>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span><strong>Thanh toán VietQR tiện lợi:</strong> Không mất phí trung gian, cấp quyền học ngay tức thời.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span><strong>Giao diện Gold Premium tối giản:</strong> Thân thiện với người không rành công nghệ.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                <span><strong>Học mọi lúc mọi nơi:</strong> Tối ưu mượt mà trên Điện thoại, Tablet và Máy tính.</span>
              </li>
            </ul>
            <Button variant="gold" asChild>
              <Link href="#courses">Bắt Đầu Học Ngay</Link>
            </Button>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-800">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80"
              alt="Học viên KIENPRO LMS"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
