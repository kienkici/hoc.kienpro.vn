"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LessonType } from "@/types/admin";

interface AddLessonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, lessonType: LessonType) => void;
}

export function AddLessonDialog({ isOpen, onClose, onSave }: AddLessonDialogProps) {
  const [title, setTitle] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("video");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, lessonType);
    setTitle("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">Thêm Bài Học Mới Vào Chương</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Tên Bài Học *</label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Bài 1 - Giới thiệu hệ thống LMS"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Loại Bài Học *</label>
            <Select value={lessonType} onValueChange={(val) => setLessonType(val as LessonType)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs">
                <SelectValue placeholder="Chọn loại bài học" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
                <SelectItem value="video">Video bài giảng</SelectItem>
                <SelectItem value="article">Bài viết tài liệu (Markdown)</SelectItem>
                <SelectItem value="quiz">Bài kiểm tra (Quiz)</SelectItem>
                <SelectItem value="assignment">Bài tập nộp file</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="gold" className="font-bold">
              Thêm Bài Học
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
