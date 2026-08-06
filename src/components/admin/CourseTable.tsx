"use client";

import Link from "next/link";
import { Edit, Copy, Eye, Trash2, BookOpen, Layers } from "lucide-react";
import { Course } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface CourseTableProps {
  courses: Course[];
  onTogglePublish: (id: string, currentStatus: string) => void;
  onDuplicate: (course: Course) => void;
  onDeleteRequest: (course: Course) => void;
}

export function CourseTable({
  courses,
  onTogglePublish,
  onDuplicate,
  onDeleteRequest,
}: CourseTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider">
          <tr>
            <th className="p-4">Khóa Học</th>
            <th className="p-4">Giá Bán</th>
            <th className="p-4">Học Viên</th>
            <th className="p-4">Chương / Bài</th>
            <th className="p-4">Trạng Thái</th>
            <th className="p-4 text-center">Xuất Bản</th>
            <th className="p-4 text-right">Thao Tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80">
          {courses.map((course) => {
            const totalLessons = course.modules.reduce(
              (acc, m) => acc + m.lessons.length,
              0
            );

            return (
              <tr key={course.id} className="hover:bg-zinc-900/80 transition-colors">
                {/* Course Name & Thumbnail */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={course.thumbnailUrl || "https://placehold.co/120x80/18181b/d4af37?text=No+Image"}
                      alt={course.title}
                      className="w-14 h-10 rounded object-cover border border-zinc-800 shrink-0"
                    />
                    <div className="min-w-0">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="font-semibold text-white hover:text-gold-400 transition-colors line-clamp-1 text-sm"
                      >
                        {course.title}
                      </Link>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        /{course.slug}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="p-4 font-medium">
                  <div className="text-gold-400 font-bold">{formatCurrency(course.salePrice)}</div>
                  {course.price > course.salePrice && (
                    <div className="text-[10px] text-zinc-500 line-through">
                      {formatCurrency(course.price)}
                    </div>
                  )}
                </td>

                {/* Students */}
                <td className="p-4 font-semibold text-white">
                  {course.studentCount.toLocaleString("vi-VN")}
                </td>

                {/* Modules / Lessons Count */}
                <td className="p-4 text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-gold-400" />
                    <span>{course.modules.length} chương ({totalLessons} bài)</span>
                  </div>
                </td>

                {/* Status */}
                <td className="p-4">
                  <StatusBadge status={course.status} />
                </td>

                {/* Publish Toggle */}
                <td className="p-4 text-center">
                  <Switch
                    checked={course.status === "published"}
                    onCheckedChange={() => onTogglePublish(course.id, course.status)}
                  />
                </td>

                {/* Actions */}
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {/* Curriculum Builder Button */}
                    <Button variant="ghost" size="icon" asChild title="Chương trình học">
                      <Link href={`/admin/courses/${course.id}/curriculum`}>
                        <Layers className="w-4 h-4 text-amber-400" />
                      </Link>
                    </Button>

                    {/* Edit Button */}
                    <Button variant="ghost" size="icon" asChild title="Chỉnh sửa">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Edit className="w-4 h-4 text-zinc-300 hover:text-white" />
                      </Link>
                    </Button>

                    {/* Duplicate Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDuplicate(course)}
                      title="Nhân bản"
                    >
                      <Copy className="w-4 h-4 text-zinc-400 hover:text-gold-400" />
                    </Button>

                    {/* Preview Button */}
                    <Button variant="ghost" size="icon" asChild title="Xem trước Public">
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <Eye className="w-4 h-4 text-zinc-400 hover:text-gold-400" />
                      </Link>
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRequest(course)}
                      title="Xóa khóa học"
                    >
                      <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
