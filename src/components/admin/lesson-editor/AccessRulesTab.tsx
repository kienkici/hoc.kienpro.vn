"use client";

import { useState } from "react";
import { Lock, Save, ShieldAlert } from "lucide-react";
import { Lesson, AccessRule, AccessRuleType } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface AccessRulesTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function AccessRulesTab({ lesson, onSaveMock }: AccessRulesTabProps) {
  const [accessRule, setAccessRule] = useState<AccessRule>(
    lesson.accessRule || { type: "immediate", value: "" }
  );
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const handleSaveAll = () => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({ accessRule });
      setSaveState("saved");
    }, 600);
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-gold-400" /> 8. Điều Kiện Mở Khóa Bài Học (Access Rules)
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-4 max-w-lg">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Loại Điều Kiện Mở Khóa *</label>
          <Select
            value={accessRule.type}
            onValueChange={(val) => {
              setAccessRule({ ...accessRule, type: val as AccessRuleType });
              setSaveState("unsaved");
            }}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
              <SelectValue placeholder="Chọn điều kiện mở bài" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
              <SelectItem value="immediate">Mở ngay sau khi sở hữu khóa học</SelectItem>
              <SelectItem value="complete_previous">Bắt buộc hoàn thành bài liền trước</SelectItem>
              <SelectItem value="pass_quiz">Bắt buộc làm đạt Quiz bài trước</SelectItem>
              <SelectItem value="after_days">Drip Content: Mở sau X ngày mua</SelectItem>
              <SelectItem value="specific_date">Mở vào ngày cụ thể (Lịch học)</SelectItem>
              <SelectItem value="admin_only">Chỉ Admin mới có quyền duyệt mở bài</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {accessRule.type === "after_days" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Số ngày mở sau đăng ký</label>
            <Input
              type="number"
              value={accessRule.value}
              onChange={(e) => {
                setAccessRule({ ...accessRule, value: e.target.value });
                setSaveState("unsaved");
              }}
              placeholder="Ví dụ: 7 (Mở vào ngày thứ 7)"
            />
          </div>
        )}

        {accessRule.type === "specific_date" && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Ngày mở bài học</label>
            <Input
              type="date"
              value={accessRule.value}
              onChange={(e) => {
                setAccessRule({ ...accessRule, value: e.target.value });
                setSaveState("unsaved");
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Điều Kiện Mở Khóa
        </Button>
      </div>
    </div>
  );
}
