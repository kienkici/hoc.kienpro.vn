import Link from "next/link";
import { PlayCircle, CheckCircle2, Lock, FileText } from "lucide-react";
import { MockLesson } from "@/lib/mock-data";
import { formatDuration, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LessonItemProps {
  lesson: MockLesson;
  courseSlug: string;
  isCurrent?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
}

export function LessonItem({
  lesson,
  courseSlug,
  isCurrent = false,
  isCompleted = false,
  isLocked = false,
}: LessonItemProps) {
  const content = (
    <div
      className={cn(
        "flex items-start justify-between p-3 rounded-lg border transition-all text-sm group gap-3",
        isCurrent
          ? "bg-gold-500/10 border-gold-500/50 text-gold-400 font-medium"
          : isCompleted
          ? "bg-zinc-900/60 border-zinc-800/60 text-zinc-300 hover:border-zinc-700"
          : "bg-zinc-900/40 border-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
        isLocked && "opacity-75 hover:border-zinc-700/80 cursor-pointer"
      )}
    >
      <div className="flex items-start gap-3 min-w-0 pr-2 flex-1">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        ) : (
          <PlayCircle className={cn("w-4 h-4 shrink-0 mt-0.5", isCurrent ? "text-gold-400" : "text-zinc-400 group-hover:text-gold-400")} />
        )}
        <span className="font-medium leading-relaxed break-words">{lesson.title}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0 mt-0.5">
        {lesson.isFreePreview ? (
          <Badge variant="gold" className="text-[10px] py-0 px-1.5 whitespace-nowrap">Học thử</Badge>
        ) : isLocked ? (
          <span className="text-[11px] text-zinc-500 hidden sm:inline-block whitespace-nowrap">Đăng ký để học</span>
        ) : null}
        <span className="text-xs text-zinc-400 whitespace-nowrap">
          {lesson.durationSeconds > 0 ? formatDuration(lesson.durationSeconds) : "Video HD"}
        </span>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <Link href={`/checkout/${courseSlug}`} title="Đăng ký khóa học để mở khóa bài học này">
        {content}
      </Link>
    );
  }

  return (
    <Link href={`/learn/${courseSlug}/${lesson.slug}`}>
      {content}
    </Link>
  );
}
