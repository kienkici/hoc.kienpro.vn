"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface LessonNotesProps {
  userId: string;
  lessonId: string;
}

export function LessonNotes({ userId, lessonId }: LessonNotesProps) {
  const [noteContent, setNoteContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      if (!userId || !lessonId) return;
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("student_notes")
          .select("content")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .maybeSingle();

        if (data) {
          setNoteContent(data.content || "");
        } else {
          setNoteContent("");
        }
      } catch (err) {
        console.error("Lỗi khi tải ghi chú:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [userId, lessonId]);

  const handleSaveNote = async () => {
    if (!userId || !lessonId) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("student_notes").upsert({
        user_id: userId,
        lesson_id: lessonId,
        content: noteContent,
        video_timestamp_seconds: 0,
        created_at: new Date().toISOString()
      }, { onConflict: "user_id,lesson_id" });

      if (error) {
        console.error("Lỗi khi lưu ghi chú:", error);
        toast.error("Không thể lưu ghi chú. Vui lòng thử lại!");
      } else {
        toast.success("Đã lưu ghi chú bài học thành công!");
      }
    } catch (err) {
      console.error("Lỗi ngoại lệ khi lưu ghi chú:", err);
      toast.error("Đã xảy ra lỗi kết nối. Vui lòng thử lại!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-zinc-500 text-xs">
        <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
        <span>Đang tải ghi chú đã lưu...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Rich Notepad Editor */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
        <div className="flex items-center gap-2 text-zinc-200">
          <FileEdit className="w-4 h-4 text-gold-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider">
            Sổ tay ghi chú bài học
          </h4>
        </div>
        
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Hãy viết lại các kiến thức quan trọng hoặc lưu trữ các link thực hành của bài học này tại đây..."
          rows={8}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold-500 leading-relaxed resize-y"
        />
        
        <div className="flex justify-end">
          <Button 
            size="sm" 
            variant="gold" 
            onClick={handleSaveNote} 
            disabled={isSaving}
            className="font-bold text-xs"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Lưu Ghi Chú
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
