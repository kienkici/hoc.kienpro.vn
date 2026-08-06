"use client";

import { useState } from "react";
import { GripVertical, Plus, Edit2, Copy, Trash2, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Module, Lesson, LessonType } from "@/types/admin";
import { LessonRow } from "./LessonRow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddLessonDialog } from "./AddLessonDialog";

interface ModuleCardProps {
  module: Module;
  courseId: string;
  onEditModule: (module: Module) => void;
  onDuplicateModule: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
  onAddLesson: (moduleId: string, title: string, type: LessonType) => void;
  onToggleLessonPublish: (lessonId: string) => void;
  onToggleLessonFreePreview: (lessonId: string) => void;
  onDuplicateLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onReorderLessons: (moduleId: string, lessonIds: string[]) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onMouseDownDrag?: () => void;
  onMouseUpDrag?: () => void;
}

export function ModuleCard({
  module,
  courseId,
  onEditModule,
  onDuplicateModule,
  onDeleteModule,
  onAddLesson,
  onToggleLessonPublish,
  onToggleLessonFreePreview,
  onDuplicateLesson,
  onDeleteLesson,
  onReorderLessons,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMouseDownDrag,
  onMouseUpDrag,
}: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [isDraggableLessonId, setIsDraggableLessonId] = useState<string | null>(null);

  const handleDragStartLesson = (e: React.DragEvent, id: string) => {
    setDraggedLessonId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverLesson = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropLesson = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetId) return;

    const dragIndex = module.lessons.findIndex((l) => l.id === draggedLessonId);
    const hoverIndex = module.lessons.findIndex((l) => l.id === targetId);

    if (dragIndex === -1 || hoverIndex === -1) return;

    const newLessons = [...module.lessons];
    const [removed] = newLessons.splice(dragIndex, 1);
    newLessons.splice(hoverIndex, 0, removed);

    onReorderLessons(module.id, newLessons.map((l) => l.id));
    setDraggedLessonId(null);
    setIsDraggableLessonId(null);
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden space-y-0"
    >
      {/* Module Header */}
      <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onMouseDown={onMouseDownDrag}
            onMouseUp={onMouseUpDrag}
            className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-300 p-1"
            title="Kéo thả để sắp xếp chương"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-left min-w-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gold-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
            )}
            <h4 className="font-bold text-sm text-white truncate">{module.title}</h4>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {module.lessons.length} bài
            </Badge>
          </button>
        </div>

        {/* Module Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddLessonOpen(true)}
            className="text-xs text-gold-400 hover:text-gold-300 gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Bài mới
          </Button>
          <button
            onClick={() => onEditModule(module)}
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            title="Sửa tên chương"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDuplicateModule(module)}
            className="p-1.5 rounded text-zinc-400 hover:text-gold-400 hover:bg-zinc-800"
            title="Nhân bản chương"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteModule(module.id)}
            className="p-1.5 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
            title="Xóa chương"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Module Lessons Container */}
      {isExpanded && (
        <div className="p-3 space-y-2 bg-zinc-950/40">
          {module.lessons.length === 0 ? (
            <div className="text-center text-xs text-zinc-500 py-6 border border-dashed border-zinc-800/80 rounded-lg">
              Chưa có bài học nào trong chương này. Bấm &quot;Bài mới&quot; để thêm.
            </div>
          ) : (
            module.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                courseId={courseId}
                onTogglePublish={onToggleLessonPublish}
                onToggleFreePreview={onToggleLessonFreePreview}
                onDuplicate={onDuplicateLesson}
                onDelete={onDeleteLesson}
                draggable={isDraggableLessonId === lesson.id}
                onDragStart={(e) => handleDragStartLesson(e, lesson.id)}
                onDragOver={handleDragOverLesson}
                onDrop={(e) => handleDropLesson(e, lesson.id)}
                onDragEnd={() => setIsDraggableLessonId(null)}
                onMouseDownDrag={() => setIsDraggableLessonId(lesson.id)}
                onMouseUpDrag={() => setIsDraggableLessonId(null)}
              />
            ))
          )}
        </div>
      )}

      {/* Add Lesson Dialog */}
      <AddLessonDialog
        isOpen={addLessonOpen}
        onClose={() => setAddLessonOpen(false)}
        onSave={(title, type) => onAddLesson(module.id, title, type)}
      />
    </div>
  );
}
