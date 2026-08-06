"use client";

import { useState } from "react";
import { Course } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SaveIndicator, SaveState } from "./SaveIndicator";
import { Save, ShieldCheck, Award } from "lucide-react";

interface CourseSettingsFormProps {
  course: Course;
  onSaveMock: (updated: Partial<Course>) => void;
}

export function CourseSettingsForm({ course, onSaveMock }: CourseSettingsFormProps) {
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [accessDurationDays, setAccessDurationDays] = useState<number | "">(
    course.accessDurationDays ?? ""
  );
  const [enableCertificate, setEnableCertificate] = useState(course.enableCertificate);
  const [completionPercentRequired, setCompletionPercentRequired] = useState(
    course.completionPercentRequired || 80
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({
        accessDurationDays: accessDurationDays === "" ? null : Number(accessDurationDays),
        enableCertificate,
        completionPercentRequired: Number(completionPercentRequired),
      });
      setSaveState("saved");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">3. Cài Đặt Khóa Học & Chứng Chỉ</h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-6 max-w-xl">
        {/* Access Duration */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">
            Thời hạn truy cập khóa học (Số ngày)
          </label>
          <Input
            type="number"
            value={accessDurationDays}
            onChange={(e) => {
              setAccessDurationDays(e.target.value === "" ? "" : Number(e.target.value));
              setSaveState("unsaved");
            }}
            placeholder="Để trống = Truy cập trọn đời (Lifetime)"
          />
          <p className="text-[11px] text-zinc-500">
            Nhập 365 để giới hạn 1 năm. Để trống nếu muốn sở hữu vĩnh viễn.
          </p>
        </div>

        {/* Certificate Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-950 border border-zinc-800">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Award className="w-4 h-4 text-gold-400" /> Cấp Chứng Chỉ Tự Động
            </div>
            <p className="text-xs text-zinc-400">
              Tự động xuất PDF chứng chỉ hoàn thành khóa học khi học viên đạt yêu cầu.
            </p>
          </div>
          <Switch
            checked={enableCertificate}
            onCheckedChange={(val) => {
              setEnableCertificate(val);
              setSaveState("unsaved");
            }}
          />
        </div>

        {/* Completion Requirement % */}
        {enableCertificate && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">
              Tỷ lệ hoàn thành tối thiểu để nhận chứng chỉ (%)
            </label>
            <Input
              type="number"
              min={1}
              max={100}
              value={completionPercentRequired}
              onChange={(e) => {
                setCompletionPercentRequired(Number(e.target.value));
                setSaveState("unsaved");
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button type="submit" variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Cài Đặt
        </Button>
      </div>
    </form>
  );
}
