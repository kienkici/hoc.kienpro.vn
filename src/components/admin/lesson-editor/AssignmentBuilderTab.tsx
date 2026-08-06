"use client";

import { useState } from "react";
import { PenTool, Save } from "lucide-react";
import { Lesson, Assignment } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { createDefaultAssignment } from "@/lib/admin-mock-data";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface AssignmentBuilderTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function AssignmentBuilderTab({ lesson, onSaveMock }: AssignmentBuilderTabProps) {
  const [assignment, setAssignment] = useState<Assignment>(
    lesson.assignment || createDefaultAssignment(lesson.id)
  );
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const handleSaveAll = () => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({ assignment });
      setSaveState("saved");
    }, 600);
  };

  const toggleResponseType = (type: "text" | "link" | "file") => {
    const current = assignment.allowedResponseTypes;
    const next = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    setAssignment({ ...assignment, allowedResponseTypes: next });
    setSaveState("unsaved");
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <PenTool className="w-5 h-5 text-gold-400" /> 7. Bài Tập Nộp Bài (Assignment Builder)
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Tên Bài Tập *</label>
          <Input
            value={assignment.title}
            onChange={(e) => {
              setAssignment({ ...assignment, title: e.target.value });
              setSaveState("unsaved");
            }}
            placeholder="Bài tập nộp kịch bản..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Mô tả chi tiết & Đề bài</label>
          <Textarea
            value={assignment.description}
            onChange={(e) => {
              setAssignment({ ...assignment, description: e.target.value });
              setSaveState("unsaved");
            }}
            rows={4}
            placeholder="Mô tả các bước thực hiện và yêu cầu đầu ra..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Thời hạn nộp (Số ngày sau khi học)</label>
            <Input
              type="number"
              value={assignment.dueDays}
              onChange={(e) => {
                setAssignment({ ...assignment, dueDays: Number(e.target.value) });
                setSaveState("unsaved");
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Điểm tối đa</label>
            <Input
              type="number"
              value={assignment.maxScore}
              onChange={(e) => {
                setAssignment({ ...assignment, maxScore: Number(e.target.value) });
                setSaveState("unsaved");
              }}
            />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-zinc-300 block">Định dạng phản hồi được phép:</label>
          <div className="flex flex-wrap gap-4 text-xs text-zinc-300">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={assignment.allowedResponseTypes.includes("text")}
                onCheckedChange={() => toggleResponseType("text")}
              />
              <span>Soạn văn bản (Text)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={assignment.allowedResponseTypes.includes("link")}
                onCheckedChange={() => toggleResponseType("link")}
              />
              <span>Đường dẫn Link (Figma, GitHub, Drive)</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={assignment.allowedResponseTypes.includes("file")}
                onCheckedChange={() => toggleResponseType("file")}
              />
              <span>Tải file đính kèm (PDF, ZIP, DOCX)</span>
            </label>
          </div>
        </div>

        <div className="pt-2">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <Switch
              checked={assignment.allowResubmit}
              onCheckedChange={(val) => {
                setAssignment({ ...assignment, allowResubmit: val });
                setSaveState("unsaved");
              }}
            />
            <span>Cho phép học viên nộp lại bài làm</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Bài Tập
        </Button>
      </div>
    </div>
  );
}
