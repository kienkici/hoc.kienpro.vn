"use client";

import Link from "next/link";
import { GripVertical, PlayCircle, Edit, Copy, Eye, EyeOff, Trash2, FileText, CheckSquare, HelpCircle } from "lucide-react";
import { Lesson } from "@/types/admin";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LessonRowProps {
  lesson: Lesson;
  courseId: string;
  onTogglePublish: (lessonId: string) => void;
  onToggleFreePreview: (lessonId: string) => void;
  onDuplicate: (lesson: Lesson) => void;
  onDelete: (lessonId: string) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onMouseDownDrag?: () => void;
  onMouseUpDrag?: () => void;
}

export function LessonRow({
  lesson,
  courseId,
  onTogglePublish,
  onToggleFreePreview,
  onDuplicate,
  onDelete,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMouseDownDrag,
  onMouseUpDrag,
}: LessonRowProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950/80 hover:border-zinc-700 transition-colors group"
    >
      {/* Left: Drag Handle & Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
        <button
          onMouseDown={onMouseDownDrag}
          onMouseUp={onMouseUpDrag}
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 transition-colors p-1"
          title="Kéo thả để sắp xếp bài học"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold-400 shrink-0">
          {lesson.lessonType === "video" ? (
            <PlayCircle className="w-4 h-4" />
          ) : lesson.lessonType === "quiz" ? (
            <HelpCircle className="w-4 h-4 text-amber-400" />
          ) : (
            <FileText className="w-4 h-4 text-zinc-300" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/courses/${courseId}/lessons/${lesson.id}`}
              className="font-semibold text-xs text-white hover:text-gold-400 transition-colors truncate"
            >
              {lesson.title}
            </Link>
            {lesson.isFreePreview && (
              <Badge variant="gold" className="text-[9px] py-0 px-1">
                Học thử
              </Badge>
            )}
            {lesson.status === "draft" && (
              <Badge variant="secondary" className="text-[9px] py-0 px-1">
                Bản nháp
              </Badge>
            )}
          </div>
          <span className="text-[10px] text-zinc-500">
            /{lesson.slug} • {formatDuration(lesson.durationSeconds)}
          </span>
        </div>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle Free Preview */}
        <button
          onClick={() => onToggleFreePreview(lesson.id)}
          className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
            lesson.isFreePreview
              ? "bg-gold-500/20 text-gold-400 border-gold-500/30"
              : "text-zinc-500 border-zinc-800 hover:text-zinc-300"
          }`}
          title="Bật/Tắt chế độ xem thử miễn phí"
        >
          Học thử
        </button>

        {/* Toggle Publish */}
        <button
          onClick={() => onTogglePublish(lesson.id)}
          className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title={lesson.status === "published" ? "Ẩn bài học" : "Xuất bản bài học"}
        >
          {lesson.status === "published" ? (
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
          )}
        </button>

        {/* Edit Lesson */}
        <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Chỉnh sửa chi tiết bài học">
          <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}`}>
            <Edit className="w-3.5 h-3.5 text-zinc-300 hover:text-white" />
          </Link>
        </Button>

        {/* Duplicate */}
        <button
          onClick={() => onDuplicate(lesson)}
          className="p-1.5 rounded text-zinc-400 hover:text-gold-400 hover:bg-zinc-900 transition-colors"
          title="Nhân bản bài học"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(lesson.id)}
          className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors"
          title="Xóa bài học"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
