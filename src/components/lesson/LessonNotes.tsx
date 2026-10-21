"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Save,
  Loader2,
  FileEdit,
  Check,
  Clock,
  Copy,
  Trash2,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveStudentNoteAction, getStudentNoteAction } from "@/server/actions/student";
import { toast } from "sonner";

interface LessonNotesProps {
  userId?: string;
  userEmail?: string;
  lessonId: string;
  lessonTitle?: string;
}

export function LessonNotes({ userId, userEmail, lessonId, lessonTitle }: LessonNotesProps) {
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const MAX_NOTE_CHARS = 10000;
  const localKey = `kienpro_note_${lessonId}_${userId || "guest"}`;
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestContentRef = useRef(noteContent);
  latestContentRef.current = noteContent;

  // 1. Fetch note from database + fallback local storage
  useEffect(() => {
    let isMounted = true;

    const loadNote = async () => {
      if (!lessonId) return;
      setIsLoading(true);
      setSaveStatus("saved");

      try {
        // Fetch from server action (per student account / email)
        const res = await getStudentNoteAction(lessonId, userId);
        
        if (!isMounted) return;

        if (res.content) {
          setNoteContent(res.content);
          setLastSavedTime(res.updatedAt || null);
          // Sync to local
          if (typeof window !== "undefined") {
            localStorage.setItem(localKey, res.content);
          }
        } else {
          // Check local storage fallback
          if (typeof window !== "undefined") {
            const localCached = localStorage.getItem(localKey);
            if (localCached) {
              setNoteContent(localCached);
              setSaveStatus("unsaved");
            } else {
              setNoteContent("");
              setLastSavedTime(null);
            }
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải ghi chú:", err);
        // Fallback to local
        if (typeof window !== "undefined") {
          const localCached = localStorage.getItem(localKey);
          if (localCached) setNoteContent(localCached);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadNote();

    return () => {
      isMounted = false;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [lessonId, userId, localKey]);

  // Core save function
  const executeSave = useCallback(
    async (contentToSave: string, isAuto = false) => {
      if (!lessonId) return;

      // Always save to local storage immediately
      if (typeof window !== "undefined") {
        localStorage.setItem(localKey, contentToSave);
      }

      setIsSaving(true);
      setSaveStatus("saving");

      try {
        const res = await saveStudentNoteAction({
          lessonId,
          content: contentToSave,
          userId,
        });

        if (res.success) {
          setSaveStatus("saved");
          setLastSavedTime(res.updatedAt || new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
          if (!isAuto) {
            toast.success("Đã lưu ghi chú bài học thành công!");
          }
        } else {
          setSaveStatus("saved"); // Saved locally
          if (!isAuto) {
            toast.info(res.error || "Ghi chú đã được lưu an toàn trên máy của bạn!");
          }
        }
      } catch (err) {
        console.error("Lỗi khi lưu ghi chú:", err);
        setSaveStatus("saved"); // Safe in localStorage
        if (!isAuto) {
          toast.info("Đã lưu ghi chú cục bộ vào trình duyệt!");
        }
      } finally {
        setIsSaving(false);
      }
    },
    [lessonId, userId, localKey]
  );

  // Content change handler with debounced auto-save (after 2.5s of typing idle)
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let val = e.target.value;
    if (val.length > MAX_NOTE_CHARS) {
      val = val.slice(0, MAX_NOTE_CHARS);
      toast.warning(`Đã đạt giới hạn tối đa ${MAX_NOTE_CHARS.toLocaleString("vi-VN")} ký tự cho sổ tay ghi chú.`);
    }

    setNoteContent(val);
    setSaveStatus("unsaved");

    // Save to local storage instantly
    if (typeof window !== "undefined") {
      localStorage.setItem(localKey, val);
    }

    // Debounced auto-save to server
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      executeSave(val, true);
    }, 2500);
  };

  // Manual save button handler
  const handleManualSave = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    executeSave(noteContent, false);
  };

  // Copy note to clipboard
  const handleCopyNote = () => {
    if (!noteContent.trim()) {
      toast.info("Chưa có nội dung ghi chú để sao chép.");
      return;
    }
    navigator.clipboard.writeText(noteContent);
    toast.success("Đã sao chép nội dung ghi chú vào clipboard!");
  };

  // Clear note
  const handleClearNote = () => {
    if (!noteContent.trim()) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ ghi chú của bài học này?")) {
      setNoteContent("");
      setSaveStatus("unsaved");
      executeSave("", false);
      toast.info("Đã xóa nội dung ghi chú.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-zinc-500 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-[#2997ff]" />
        <span>Đang nạp sổ tay ghi chú của bạn...</span>
      </div>
    );
  }

  const wordCount = noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0;
  const charCount = noteContent.length;
  const percentUsed = Math.min(100, Math.round((charCount / MAX_NOTE_CHARS) * 100));
  const isNearLimit = charCount >= 9000 && charCount < MAX_NOTE_CHARS;
  const isAtLimit = charCount >= MAX_NOTE_CHARS;

  return (
    <div className="space-y-4">
      {/* Student Notepad Container */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 space-y-4 shadow-xl">
        {/* Header: Title + Student Account Info + Save Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileEdit className="w-4 h-4 text-[#2997ff]" />
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Sổ Tay Ghi Chú Cá Nhân
              </h4>
            </div>
            
            {/* Student Account Identity Indicator */}
            <div className="flex items-center gap-2 text-xs">
              {userEmail ? (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Học viên: <b className="text-zinc-200">{userEmail}</b></span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Lưu trên trình duyệt này • Đăng nhập để đồng bộ vĩnh viễn theo email</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20 font-medium">
                <Check className="w-3.5 h-3.5" />
                {lastSavedTime ? `Đã lưu (${lastSavedTime})` : "Đã lưu an toàn"}
              </span>
            )}
            {saveStatus === "unsaved" && (
              <span className="flex items-center gap-1.5 text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
                <Clock className="w-3 h-3 text-amber-400" /> Có thay đổi chưa lưu
              </span>
            )}
          </div>
        </div>

        {/* Textarea Notebook Area */}
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/40 focus-within:border-zinc-700 transition-colors overflow-hidden">
          <textarea
            value={noteContent}
            onChange={handleContentChange}
            maxLength={MAX_NOTE_CHARS}
            placeholder="Hãy viết lại các kiến thức cốt lõi, link tài liệu hoặc bài học kinh nghiệm của bạn ở đây...&#10;&#10;• Hệ thống sẽ tự động lưu lại theo từng tài khoản học viên để bạn xem lại bất cứ lúc nào."
            rows={10}
            className="w-full bg-transparent p-4 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-y min-h-[220px]"
          />

          {/* Usage Progress Line */}
          <div className="w-full bg-zinc-800/80 h-1 overflow-hidden">
            <div
              style={{ width: `${percentUsed}%` }}
              className={`h-full transition-all duration-300 ${
                isAtLimit ? "bg-rose-500" : isNearLimit ? "bg-amber-400" : "bg-[#0071e3]"
              }`}
            />
          </div>

          {/* Bottom stats within editor */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/40 text-[11px]">
            <div className="flex items-center gap-3">
              <span className="text-zinc-500">{wordCount} từ</span>
              <span className="text-zinc-700">•</span>
              <span
                className={`font-mono transition-colors ${
                  isAtLimit
                    ? "text-rose-400 font-bold"
                    : isNearLimit
                    ? "text-amber-400 font-semibold"
                    : "text-zinc-400"
                }`}
              >
                {charCount.toLocaleString("vi-VN")} / {MAX_NOTE_CHARS.toLocaleString("vi-VN")} ký tự
              </span>
              {isAtLimit && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-medium">
                  Đã chạm giới hạn
                </span>
              )}
              {isNearLimit && !isAtLimit && (
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded font-medium">
                  Sắp đạt giới hạn
                </span>
              )}
            </div>
            <span className="text-zinc-500">Tự động cập nhật lưu lại sau khi gõ</span>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Quick utility tools */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyNote}
              disabled={!noteContent.trim()}
              className="h-8 text-xs border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5 mr-1 text-[#2997ff]" /> Sao chép
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearNote}
              disabled={!noteContent.trim()}
              className="h-8 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa nội dung
            </Button>
          </div>

          {/* Primary Save Button */}
          <Button
            type="button"
            size="sm"
            onClick={handleManualSave}
            disabled={isSaving}
            className="h-9 font-semibold text-xs bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-[#0071e3]/25 px-5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Đang Lưu...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" /> Lưu Ghi Chú
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
