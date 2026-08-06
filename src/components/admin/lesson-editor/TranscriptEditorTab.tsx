"use client";

import { useState } from "react";
import { Plus, Trash2, Save, FileText, Download, Upload, Clock } from "lucide-react";
import { Lesson, TranscriptSegment } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateId } from "@/lib/admin-mock-data";
import { formatDuration } from "@/lib/utils";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface TranscriptEditorTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function TranscriptEditorTab({ lesson, onSaveMock }: TranscriptEditorTabProps) {
  const [segments, setSegments] = useState<TranscriptSegment[]>(lesson.transcriptSegments || []);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  // New segment inputs
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [content, setContent] = useState("");

  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newSeg: TranscriptSegment = {
      id: generateId("ts"),
      startTime: Number(startTime),
      endTime: Number(endTime),
      content,
      orderIndex: segments.length,
    };

    setSegments([...segments, newSeg].sort((a, b) => a.startTime - b.startTime));
    setContent("");
    setStartTime(endTime);
    setEndTime(endTime + 10);
    setSaveState("unsaved");
  };

  const handleDelete = (id: string) => {
    setSegments(segments.filter((s) => s.id !== id));
    setSaveState("unsaved");
  };

  const handleSaveAll = () => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({ transcriptSegments: segments });
      setSaveState("saved");
    }, 600);
  };

  // Import mock SRT
  const handleImportMockSRT = () => {
    const mockSRT: TranscriptSegment[] = [
      { id: generateId("ts"), startTime: 0, endTime: 5, content: "Chào mừng các bạn đến với KIENPRO LMS.", orderIndex: 0 },
      { id: generateId("ts"), startTime: 5, endTime: 12, content: "Hôm nay chúng ta cùng tìm hiểu kiến trúc giao diện Gold Premium.", orderIndex: 1 },
    ];
    setSegments(mockSRT);
    setSaveState("unsaved");
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-400" /> 4. Trình Biên Tập Transcript Lời Dịch (SRT / VTT)
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      {/* Action Import / Export */}
      <div className="flex flex-wrap gap-2 pb-2">
        <Button variant="outline" size="sm" onClick={handleImportMockSRT} className="text-xs">
          <Upload className="w-3.5 h-3.5 mr-1" /> Import SRT / VTT Mock
        </Button>
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1" /> Export Transcript Text
        </Button>
      </div>

      {/* Add New Segment Form */}
      <form onSubmit={handleAddSegment} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thêm Đoạn Lời Dịch Tự Thủ Công</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Thời gian bắt đầu (giây)</label>
            <Input type="number" value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="text-xs" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">Thời gian kết thúc (giây)</label>
            <Input type="number" value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="text-xs" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] text-zinc-400 block mb-1">Nội dung câu nói</label>
            <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nhập lời thoại bài giảng..." className="text-xs" required />
          </div>
        </div>
        <div className="flex justify-end pt-1">
          <Button type="submit" variant="gold" size="sm" className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Đoạn
          </Button>
        </div>
      </form>

      {/* Transcript List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {segments.length === 0 ? (
          <div className="text-center text-xs text-zinc-500 py-6 border border-dashed border-zinc-800 rounded-lg">
            Chưa có transcript nào. Bấm &quot;Import SRT&quot; hoặc tự nhập câu thoại.
          </div>
        ) : (
          segments.map((seg) => (
            <div key={seg.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-gold-400 font-mono flex items-center gap-1 shrink-0 font-semibold">
                  <Clock className="w-3 h-3" /> {formatDuration(seg.startTime)} - {formatDuration(seg.endTime)}
                </span>
                <p className="text-zinc-200">{seg.content}</p>
              </div>

              <button onClick={() => handleDelete(seg.id)} className="p-1 text-zinc-500 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Transcript
        </Button>
      </div>
    </div>
  );
}
