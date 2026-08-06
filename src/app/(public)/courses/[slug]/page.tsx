import Link from "next/image"; // Note: we should import Image from "next/image" instead of Link!
import NextLink from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, Users, CheckCircle2, ShieldCheck, PlayCircle, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModuleAccordion } from "@/components/course/ModuleAccordion";
import { createClient } from "@/lib/supabase/server";

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: courseData, error } = await supabase
    .from("courses")
    .select(`
      *,
      course_modules (
        *,
        lessons (
          *
        )
      )
    `)
    .eq("slug", params.slug)
    .is("deleted_at", null)
    .single();

  if (error || !courseData) {
    notFound();
  }

  const course = {
    id: courseData.id,
    title: courseData.title,
    slug: courseData.slug,
    subtitle: courseData.short_description || "",
    description: courseData.description || "",
    thumbnailUrl: courseData.thumbnail_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    price: Number(courseData.original_price),
    salePrice: Number(courseData.sale_price),
    studentCount: 1280, // Default mock value
    rating: 4.9,
    reviewCount: 342,
    instructorName: "Kiên Pro",
    highlights: [
      "Tự tay làm Website LMS & Landing Page cao cấp chỉ trong 3 ngày",
      "Tự động hóa thanh toán VietQR 0% phí giao dịch",
      "Bảo mật HLS mã hóa video chống tải xuống",
      "Bộ Template thiết kế Gold Premium làm sẵn",
    ],
    modules: (courseData.course_modules || []).map((m: any) => ({
      id: m.id,
      title: m.title,
      lessons: (m.lessons || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        isFreePreview: l.is_preview,
        durationSeconds: l.duration_seconds || 0,
      })).sort((a: any, b: any) => a.order_index - b.order_index),
    })).sort((a: any, b: any) => a.order_index - b.order_index),
  };

  const discountPercent = course.price > 0 ? Math.round(
    ((course.price - course.salePrice) / course.price) * 100
  ) : 0;

  return (
    <div className="py-12 space-y-12">
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
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-bold text-white">Bạn sẽ nhận được gì trong khóa học này?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
              {course.highlights.map((h, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0 mt-1" />
                  <span>{h}</span>
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

            <Button size="lg" variant="gold" asChild className="w-full text-base font-bold">
              <NextLink href={`/checkout/${course.slug}`}>
                Đăng Ký Mua Ngay <ArrowRight className="w-5 h-5 ml-2" />
              </NextLink>
            </Button>

            <div className="text-center text-[11px] text-zinc-500 space-y-1">
              <p>🔒 Thanh toán an toàn 100% qua Ngân hàng Việt Nam</p>
              <p>Email kích hoạt tự động gửi ngay sau khi quét QR</p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION */}
      <section className="container max-w-7xl mx-auto px-4 max-w-4xl space-y-6">
        <h2 className="text-2xl font-bold text-white">Nội dung lộ trình bài học</h2>
        <ModuleAccordion modules={course.modules as any} courseSlug={course.slug} />
      </section>
    </div>
  );
}
