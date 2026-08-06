"use client";

import { useState } from "react";
import { Lesson } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface LessonContentTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function LessonContentTab({ lesson, onSaveMock }: LessonContentTabProps) {
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [title, setTitle] = useState(lesson.title);
  const [slug, setSlug] = useState(lesson.slug);
  const [description, setDescription] = useState(lesson.description || "");
  const [contentMarkdown, setContentMarkdown] = useState(lesson.contentMarkdown || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({
        title,
        slug,
        description,
        contentMarkdown,
      });
      setSaveState("saved");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white">1. Nội Dung Bài Học (Markdown)</h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Tên Bài Học *</label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveState("unsaved");
              }}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Slug URL *</label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSaveState("unsaved");
              }}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Mô tả ngắn bài học</label>
          <Input
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSaveState("unsaved");
            }}
            placeholder="Tóm tắt ý chính của bài giảng..."
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Nội dung chi tiết (Định dạng Markdown / HTML)</label>
          <Textarea
            value={contentMarkdown}
            onChange={(e) => {
              setContentMarkdown(e.target.value);
              setSaveState("unsaved");
            }}
            rows={10}
            placeholder="### Tiêu đề bài học&#10;Viết nội dung kiến thức bài học ở đây..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button type="submit" variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Nội Dung
        </Button>
      </div>
    </form>
  );
}
