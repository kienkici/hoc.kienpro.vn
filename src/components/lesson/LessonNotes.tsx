"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MockLessonNote } from "@/lib/mock-data";
import { formatDuration } from "@/lib/utils";

interface LessonNotesProps {
  initialNotes?: MockLessonNote[];
}

export function LessonNotes({ initialNotes = [] }: LessonNotesProps) {
  const [notes, setNotes] = useState<MockLessonNote[]>(initialNotes);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const created: MockLessonNote = {
      id: `note-${Date.now()}`,
      lessonId: "les-101",
      lessonTitle: "Bài 1: Giới thiệu KIENPRO LMS",
      courseTitle: "Khóa Học Thiết Kế Website AI",
      timestampSeconds: 120,
      content: newNote,
      createdAt: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    };
    setNotes([created, ...notes]);
    setNewNote("");
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Create Note Input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
        <label className="text-xs font-semibold text-zinc-300 block">
          Tạo ghi chú tại phút 02:00
        </label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Nhập ghi chú quan trọng cho bài học này..."
          rows={3}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-gold-500"
        />
        <div className="flex justify-end">
          <Button size="sm" variant="gold" onClick={handleAddNote}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Lưu Ghi Chú
          </Button>
        </div>
      </div>

      {/* List Notes */}
      <div className="space-y-2.5">
        {notes.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6">Chưa có ghi chú nào cho bài học này.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gold-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatDuration(note.timestampSeconds)}</span>
                  <span className="text-zinc-500 font-normal">• {note.createdAt}</span>
                </div>
                <p className="text-zinc-200 leading-relaxed">{note.content}</p>
              </div>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-zinc-500 hover:text-red-400 p-1"
                title="Xóa ghi chú"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
