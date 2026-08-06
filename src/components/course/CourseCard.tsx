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
    <div className="group rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col hover:border-gold-500/40 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-300">
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
        <Image
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="gold">GIẢM {discountPercent}%</Badge>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
              <strong className="text-white">{course.rating}</strong> ({course.reviewCount})
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.studentCount} học viên
            </span>
          </div>

          <Link href={`/courses/${course.slug}`}>
            <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-gold-400 transition-colors">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-zinc-400 line-clamp-2">
            {course.subtitle}
          </p>
        </div>

        {/* Pricing & Footer */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-gold-400">
              {formatCurrency(course.salePrice)}
            </div>
            <div className="text-xs text-zinc-500 line-through">
              {formatCurrency(course.price)}
            </div>
          </div>

          {showEnrollButton && (
            <Button size="sm" variant="gold" asChild>
              <Link href={`/courses/${course.slug}`}>
                Chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
