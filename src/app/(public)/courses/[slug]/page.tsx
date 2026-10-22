import NextLink from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Users, CheckCircle2, ShieldCheck, PlayCircle, ArrowRight, BookOpen, Clock, Lock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleAccordion } from "@/components/course/ModuleAccordion";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  // Dùng admin client để đọc đầy đủ danh sách chương & bài học (bảo mật, chỉ đọc metadata)
  const adminSupabase = createAdminClient();
  const supabase = createClient();

  const { data: courseData, error } = await adminSupabase
    .from("courses")
    .select(`
      *,
      course_modules (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          slug,
          is_preview,
          duration_seconds,
          order_index
        )
      )
    `)
    .eq("slug", params.slug)
    .is("deleted_at", null)
    .single();

  if (error || !courseData) {
    notFound();
  }

  // Kiểm tra xem học viên hiện tại đã đăng ký khóa học chưa
  let isEnrolled = false;
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      const { data: enrollment } = await adminSupabase
        .from("enrollments")
        .select("id")
        .eq("user_id", authData.user.id)
        .eq("course_id", courseData.id)
        .eq("status", "ACTIVE")
        .maybeSingle();
      if (enrollment) {
        isEnrolled = true;
      }
    }
  } catch (err) {
    // Không đăng nhập thì là khách vãng lai
  }

  // Danh mục quyền lợi thiết kế riêng chuẩn cho từng khóa học
  const defaultHighlightsBySlug: Record<string, string[]> = {
    "khoa-hoc-facebook-co-ban-den-chuyen-sau": [
      "Nắm trọn bản chất & thuật toán phân phối Facebook Ads 2026",
      "Xây dựng hệ thống tài khoản bất tử, nuôi Via & tạo BM Doanh nghiệp",
      "Làm Video Viral AI (Google Flow) & Sáng tạo Content chuyển đổi cao",
      "Kỹ thuật Target chuẩn xác: Tệp tuỳ chỉnh, Lookalike & Data SĐT/Email",
      "Thực chiến setup mọi chiến dịch: Tin nhắn, Video tương tác, Like Page & Pixel",
      "Đọc hiểu báo cáo chỉ số, tối ưu chi phí rẻ nhất & kỹ thuật Scale ngân sách",
      "Bí quyết 100 cách tối ưu chiến dịch tránh lãng phí tiền quảng cáo",
      "Hỗ trợ giải đáp thắc mắc và cập nhật kiến thức Facebook Ads liên tục",
    ],
    "ai-thiet-ke-landing-page-tu-dong": [
      "Tự tay làm Website LMS & Landing Page cao cấp chỉ trong 3 ngày",
      "Tự động hóa thanh toán VietQR 0% phí giao dịch, kích hoạt tức thì",
      "Bảo mật HLS mã hóa video chống tải xuống chuẩn thương hiệu lớn",
      "Tích hợp Chatbot AI tư vấn và chốt đơn tự động 24/7",
      "Tặng trọn bộ Template thiết kế Apple Dark & Gold Premium làm sẵn",
      "Hướng dẫn tối ưu SEO lên top Google và trải nghiệm người dùng mượt mà",
    ],
  };

  const highlights = defaultHighlightsBySlug[courseData.slug] || [
    "Nội dung cô đọng, thực chiến và dễ hiểu từ con số 0",
    "Hỗ trợ trực tiếp từ giảng viên Kiên Pro trong suốt quá trình học",
    "Sở hữu tài liệu và video bài giảng vĩnh viễn",
    "Cập nhật kiến thức mới liên tục hoàn toàn miễn phí",
  ];

  const course = {
    id: courseData.id,
    title: courseData.title,
    slug: courseData.slug,
    subtitle: courseData.short_description || "",
    description: courseData.description || "",
    thumbnailUrl: courseData.thumbnail_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    price: Number(courseData.original_price),
    salePrice: Number(courseData.sale_price),
    studentCount: 1280, // Giá trị hiển thị uy tín
    rating: 4.9,
    reviewCount: 342,
    instructorName: "Kiên Pro",
    highlights,
    modules: (courseData.course_modules || [])
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        lessons: (m.lessons || [])
          .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            slug: l.slug,
            isFreePreview: l.is_preview,
            durationSeconds: l.duration_seconds || 0,
          })),
      })),
  };

  // Tính tổng số bài và thời lượng toàn bộ khóa học
  const totalLessons = course.modules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0);
  const totalDurationSeconds = course.modules.reduce(
    (acc: number, m: any) => acc + (m.lessons?.reduce((lAcc: number, l: any) => lAcc + (l.durationSeconds || 0), 0) || 0),
    0
  );
  const totalHours = Math.floor(totalDurationSeconds / 3600);
  const totalMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const durationSummary = totalHours > 0 
    ? `${totalHours} giờ ${totalMinutes > 0 ? `${totalMinutes} phút` : ''}`
    : `${totalMinutes} phút`;

  const discountPercent = course.price > 0 ? Math.round(
    ((course.price - course.salePrice) / course.price) * 100
  ) : 0;

  return (
    <div className="py-12 space-y-16">
      {/* HERO / OVERVIEW SECTION */}
      <section className="container max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2">
            {discountPercent > 0 && <Badge variant="gold">GIẢM {discountPercent}% HÔM NAY</Badge>}
            <span className="text-xs text-zinc-400">Thương hiệu: {course.instructorName}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-base text-zinc-300 leading-relaxed">
            {course.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400 py-3 border-y border-zinc-800">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
              <strong className="text-white text-sm">{course.rating}</strong> ({course.reviewCount} đánh giá)
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-400" />
              {course.studentCount} học viên đã đăng ký
            </span>
            <span className="flex items-center gap-1.5 text-gold-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              Cấp tự động VietQR 10s
            </span>
          </div>

          {/* Highlights */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-5 bg-gold-400 rounded-full inline-block" />
              Bạn sẽ nhận được gì trong khóa học này?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm text-zinc-200">
              {course.highlights.map((h, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Card Sticky */}
        <div className="lg:col-span-1 sticky top-24">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 space-y-6 shadow-xl shadow-gold-500/5">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
              <Image
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <PlayCircle className="w-12 h-12 text-gold-400 opacity-90" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-gold-400">
                  {formatCurrency(course.salePrice)}
                </span>
                {course.price > course.salePrice && (
                  <span className="text-sm text-zinc-500 line-through">
                    {formatCurrency(course.price)}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400 font-medium">
                Khuyến mãi chỉ áp dụng khi thanh toán quét VietQR
              </p>
            </div>

            {isEnrolled ? (
              <Button size="lg" variant="gold" asChild className="w-full text-base font-bold">
                <NextLink href={`/learn/${course.slug}`}>
                  Vào Học Ngay <ArrowRight className="w-5 h-5 ml-2" />
                </NextLink>
              </Button>
            ) : (
              <Button size="lg" variant="gold" asChild className="w-full text-base font-bold">
                <NextLink href={`/checkout/${course.slug}`}>
                  Đăng Ký Mua Ngay <ArrowRight className="w-5 h-5 ml-2" />
                </NextLink>
              </Button>
            )}

            <div className="text-center text-[11px] text-zinc-500 space-y-1">
              <p>🔒 Thanh toán an toàn 100% qua Ngân hàng Việt Nam</p>
              <p>Email kích hoạt tự động gửi ngay sau khi quét QR</p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION */}
      <section className="container max-w-7xl mx-auto px-4 max-w-4xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-gold-400" />
              Nội dung lộ trình bài học
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Khám phá toàn bộ {totalLessons} bài giảng thực chiến được sắp xếp bài bản theo từng bước
            </p>
          </div>
          <div className="flex items-center gap-2.5 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-full self-start sm:self-auto shadow-sm">
            <span>{course.modules.length} chương</span>
            <span className="text-zinc-600">•</span>
            <span className="text-gold-400 font-semibold">{totalLessons} bài học</span>
            {totalDurationSeconds > 0 && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {durationSummary}
                </span>
              </>
            )}
          </div>
        </div>

        <ModuleAccordion modules={course.modules as any} courseSlug={course.slug} />
      </section>

      {/* DETAILED DESCRIPTION & TARGET AUDIENCE */}
      {course.description && (
        <section className="container max-w-7xl mx-auto px-4 max-w-4xl space-y-6">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 md:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gold-400 rounded-full inline-block" />
              Thông tin chi tiết khóa học
            </h2>
            <div className="text-zinc-300 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line">
              {course.description}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
