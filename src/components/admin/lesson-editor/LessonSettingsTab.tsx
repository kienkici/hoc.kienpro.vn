"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { Lesson, CourseStatus } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface LessonSettingsTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function LessonSettingsTab({ lesson, onSaveMock }: LessonSettingsTabProps) {
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [durationSeconds, setDurationSeconds] = useState(lesson.durationSeconds || 0);
  const [status, setStatus] = useState<CourseStatus>(lesson.status || "draft");
  const [isFreePreview, setIsFreePreview] = useState(lesson.isFreePreview || false);
  const [isRequired, setIsRequired] = useState(lesson.isRequired ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({
        durationSeconds: Number(durationSeconds),
        status,
        isFreePreview,
        isRequired,
      });
      setSaveState("saved");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-gold-400" /> 9. Cài Đặt Bài Học & Thời Lượng
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Thời lượng bài học (Tổng số giây)</label>
          <Input
            type="number"
            value={durationSeconds}
            onChange={(e) => {
              setDurationSeconds(Number(e.target.value));
              setSaveState("unsaved");
            }}
            placeholder="Ví dụ: 750 (tương đương 12 phút 30 giây)"
          />
          <p className="text-[11px] text-zinc-500">
            = {Math.floor(durationSeconds / 60)} phút {durationSeconds % 60} giây
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Trạng thái xuất bản bài học</label>
          <Select
            value={status}
            onValueChange={(val) => {
              setStatus(val as CourseStatus);
              setSaveState("unsaved");
            }}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
              <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
              <SelectItem value="published">Đã xuất bản (Published)</SelectItem>
              <SelectItem value="archived">Lưu trữ (Archived)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <h5 className="text-xs font-semibold text-white">Cho phép học thử miễn phí</h5>
              <p className="text-[11px] text-zinc-400">Khách chưa mua hàng vẫn có thể xem video bài học này</p>
            </div>
            <Switch
              checked={isFreePreview}
              onCheckedChange={(val) => {
                setIsFreePreview(val);
                setSaveState("unsaved");
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <div>
              <h5 className="text-xs font-semibold text-white">Bắt buộc phải hoàn thành</h5>
              <p className="text-[11px] text-zinc-400">Tính bài này vào % tiến độ hoàn thành khóa học</p>
            </div>
            <Switch
              checked={isRequired}
              onCheckedChange={(val) => {
                setIsRequired(val);
                setSaveState("unsaved");
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button type="submit" variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Cài Đặt Bài Học
        </Button>
      </div>
    </form>
  );
}
