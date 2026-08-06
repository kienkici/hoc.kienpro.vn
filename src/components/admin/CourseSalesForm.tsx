"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Image as ImageIcon, Video } from "lucide-react";
import { Course } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SaveIndicator, SaveState } from "./SaveIndicator";

interface CourseSalesFormProps {
  course: Course;
  onSaveMock: (updated: Partial<Course>) => void;
}

export function CourseSalesForm({ course, onSaveMock }: CourseSalesFormProps) {
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl);
  const [previewVideoUrl, setPreviewVideoUrl] = useState(course.previewVideoUrl || "");
  const [highlights, setHighlights] = useState<string[]>(course.highlights || []);

  const handleAddHighlight = () => {
    setHighlights([...highlights, ""]);
    setSaveState("unsaved");
  };

  const handleHighlightChange = (index: number, val: string) => {
    const next = [...highlights];
    next[index] = val;
    setHighlights(next);
    setSaveState("unsaved");
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
    setSaveState("unsaved");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({
        thumbnailUrl,
        previewVideoUrl,
        highlights: highlights.filter((h) => h.trim().length > 0),
      });
      setSaveState("saved");
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">2. Nội Dung Bán Hàng & Hình Ảnh Khóa Học</h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-6">
        {/* Thumbnail Image */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gold-400" /> Ảnh Thumbnail Khóa Học (Tỷ lệ 16:9)
          </label>
          <Input
            value={thumbnailUrl}
            onChange={(e) => {
              setThumbnailUrl(e.target.value);
              setSaveState("unsaved");
            }}
            placeholder="https://images.unsplash.com/..."
          />
          {thumbnailUrl && (
            <div className="relative aspect-video w-48 rounded-lg overflow-hidden border border-zinc-800 mt-2">
              <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Video Preview Demo */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Video className="w-4 h-4 text-gold-400" /> Link Video Học Thử / Trailer Giới Thiệu (MP4 / HLS)
          </label>
          <Input
            value={previewVideoUrl}
            onChange={(e) => {
              setPreviewVideoUrl(e.target.value);
              setSaveState("unsaved");
            }}
            placeholder="https://commondatastorage.googleapis.com/..."
          />
        </div>

        {/* Course Highlights */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-300">
              Điểm Nổi Bật / Lợi Ích Học Viên Nhận Được (Highlights)
            </label>
            <Button type="button" variant="outline" size="sm" onClick={handleAddHighlight} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Ý Nổi Bật
            </Button>
          </div>

          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={h}
                  onChange={(e) => handleHighlightChange(i, e.target.value)}
                  placeholder={`Điểm nổi bật ${i + 1}`}
                  className="text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(i)}
                  className="p-2 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button type="submit" variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Nội Dung Bán Hàng
        </Button>
      </div>
    </form>
  );
}
