"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface LessonChecklistProps {
  initialItems?: ChecklistItem[];
}

export function LessonChecklist({ initialItems = [] }: LessonChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-xs text-zinc-500 py-4">
        Không có checklist thực hành cho bài học này.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
        Checklist Thực Hành Bài Học
      </h4>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5">
            <Checkbox
              id={item.id}
              checked={item.completed}
              onCheckedChange={() => toggleItem(item.id)}
            />
            <label
              htmlFor={item.id}
              className={`text-xs cursor-pointer select-none ${
                item.completed ? "line-through text-zinc-500" : "text-zinc-200 font-medium"
              }`}
            >
              {item.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
