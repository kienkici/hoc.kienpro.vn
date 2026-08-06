import { Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveState = "unsaved" | "saving" | "saved" | "error";

interface SaveIndicatorProps {
  state: SaveState;
  lastSavedAt?: string;
  className?: string;
}

export function SaveIndicator({ state, lastSavedAt, className }: SaveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs font-medium", className)}>
      {state === "saving" && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
          <span className="text-gold-400">Đang lưu thay đổi...</span>
        </>
      )}
      {state === "saved" && (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Đã lưu {lastSavedAt ? `lúc ${lastSavedAt}` : ""}</span>
        </>
      )}
      {state === "unsaved" && (
        <>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400">Có thay đổi chưa lưu</span>
        </>
      )}
      {state === "error" && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400">Lỗi lưu dữ liệu</span>
        </>
      )}
    </div>
  );
}
