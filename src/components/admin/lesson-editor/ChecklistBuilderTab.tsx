"use client";

import { useState } from "react";
import { Plus, Trash2, Save, CheckSquare } from "lucide-react";
import { Lesson, ChecklistItem } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { generateId } from "@/lib/admin-mock-data";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface ChecklistBuilderTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function ChecklistBuilderTab({ lesson, onSaveMock }: ChecklistBuilderTabProps) {
  const [items, setItems] = useState<ChecklistItem[]>(lesson.checklist || []);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const [text, setText] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newItem: ChecklistItem = {
      id: generateId("cl"),
      text,
      description,
      isRequired,
      orderIndex: items.length,
    };

    setItems([...items, newItem]);
    setText("");
    setDescription("");
    setSaveState("unsaved");
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setSaveState("unsaved");
  };

  const handleSaveAll = () => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({ checklist: items });
      setSaveState("saved");
    }, 600);
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-gold-400" /> 5. Checklist Bài Tập Thực Hành Bài Học
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      {/* Add New Item */}
      <form onSubmit={handleAddItem} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thêm Tiêu Chí Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Yêu cầu thực hành (Ví dụ: Xem hết video 12 phút)..."
            className="text-xs"
            required
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả bổ sung chi tiết (Tùy chọn)..."
            className="text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <Switch checked={isRequired} onCheckedChange={setIsRequired} />
            <span>Bắt buộc phải tích chọn mới được tính hoàn thành bài</span>
          </label>
          <Button type="submit" variant="gold" size="sm" className="text-xs font-bold">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Checklist
          </Button>
        </div>
      </form>

      {/* Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center text-xs text-zinc-500 py-6 border border-dashed border-zinc-800 rounded-lg">
            Chưa có checklist nào. Bấm nút phía trên để thêm yêu cầu thực hành cho học viên.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{item.text}</span>
                  {item.isRequired && <span className="text-[10px] text-red-400 font-bold">*Bắt buộc</span>}
                </div>
                {item.description && <p className="text-[11px] text-zinc-400 mt-0.5">{item.description}</p>}
              </div>

              <button onClick={() => handleDelete(item.id)} className="p-1 text-zinc-500 hover:text-red-400">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Checklist
        </Button>
      </div>
    </div>
  );
}
