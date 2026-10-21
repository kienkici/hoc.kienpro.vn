import Link from "next/link";
import Image from "next/image";
import { Star, Users, Clock, ArrowRight } from "lucide-react";
import { MockCourse } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: MockCourse;
  showEnrollButton?: boolean;
}

export function CourseCard({ course, showEnrollButton = true }: CourseCardProps) {
  const discountPercent = Math.round(
    ((course.price - course.salePrice) / course.price) * 100
  );

  return (
    <div className="group rounded-3xl border border-white/[0.08] bg-[#0c0c0e] hover:bg-[#111115] overflow-hidden flex flex-col hover:border-white/20 transition-all duration-500 hover:shadow-[0_25px_60px_rgba(0,0,0,0.9)]">
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-60" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 text-[11px] font-semibold tracking-wide uppercase rounded-full bg-white text-black shadow-sm">
            TIẾT KIỆM {discountPercent}%
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-[#86868b]">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Star className="w-3.5 h-3.5 fill-[#2997ff] text-[#2997ff]" />
              <span>{course.rating}</span>
              <span className="text-zinc-500 font-normal">({course.reviewCount})</span>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-500" />
              {course.studentCount.toLocaleString("vi-VN")} học viên
            </span>
          </div>

          <Link href={`/courses/${course.slug}`}>
            <h3 className="text-lg font-bold text-white leading-snug group-hover:text-[#2997ff] transition-colors">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-[#86868b] leading-relaxed line-clamp-2">
            {course.subtitle}
          </p>
        </div>

        {/* Pricing & Footer */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="text-xl font-bold tracking-tight text-white">
              {formatCurrency(course.salePrice)}
            </div>
            <div className="text-xs text-zinc-500 line-through">
              {formatCurrency(course.price)}
            </div>
          </div>

          {showEnrollButton && (
            <Button size="sm" asChild className="rounded-full bg-[#0071e3] text-white hover:bg-[#0077ed] text-xs font-semibold px-4 py-2 transition-all shadow-[0_0_15px_rgba(0,113,227,0.3)]">
              <Link href={`/courses/${course.slug}`}>
                Xem khóa học <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
