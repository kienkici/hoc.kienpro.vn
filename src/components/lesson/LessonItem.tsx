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
        "flex items-center justify-between p-3 rounded-lg border transition-all text-sm group",
        isCurrent
          ? "bg-gold-500/10 border-gold-500/50 text-gold-400 font-medium"
          : isCompleted
          ? "bg-zinc-900/60 border-zinc-800/60 text-zinc-300 hover:border-zinc-700"
          : "bg-zinc-900/40 border-zinc-800/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
        isLocked && "opacity-60 cursor-not-allowed hover:border-zinc-800/40"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : isLocked ? (
          <Lock className="w-4 h-4 text-zinc-500 shrink-0" />
        ) : (
          <PlayCircle className={cn("w-4 h-4 shrink-0", isCurrent ? "text-gold-400" : "text-zinc-400 group-hover:text-gold-400")} />
        )}
        <span className="truncate font-medium">{lesson.title}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lesson.isFreePreview && <Badge variant="gold" className="text-[10px] py-0 px-1.5">Học thử</Badge>}
        <span className="text-xs text-zinc-500">{formatDuration(lesson.durationSeconds)}</span>
      </div>
    </div>
  );

  if (isLocked) {
    return content;
  }

  return (
    <Link href={`/learn/${courseSlug}/${lesson.slug}`}>
      {content}
    </Link>
  );
}
