"use client";

import { useState } from "react";
import { Plus, Layers, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Course, Module, Lesson, LessonType } from "@/types/admin";
import { ModuleCard } from "./ModuleCard";
import { AddModuleDialog } from "./AddModuleDialog";
import { Button } from "@/components/ui/button";
import { SaveIndicator, SaveState } from "./SaveIndicator";
import { createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson, reorderLessons, reorderModules } from "@/server/actions/course";
import { toast } from "sonner";

interface CurriculumBuilderProps {
  course: Course;
  onSaveMock: (updatedModules: Module[]) => void;
}

export function CurriculumBuilder({ course, onSaveMock }: CurriculumBuilderProps) {
  const [modules, setModules] = useState<Module[]>(course.modules || []);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [isDraggableModuleId, setIsDraggableModuleId] = useState<string | null>(null);

  const handleDragStartModule = (e: React.DragEvent, id: string) => {
    setDraggedModuleId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverModule = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropModule = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedModuleId || draggedModuleId === targetId) return;

    const dragIndex = modules.findIndex((m) => m.id === draggedModuleId);
    const hoverIndex = modules.findIndex((m) => m.id === targetId);

    if (dragIndex === -1 || hoverIndex === -1) return;

    const newModules = [...modules];
    const [removed] = newModules.splice(dragIndex, 1);
    newModules.splice(hoverIndex, 0, removed);

    // Optimistically update UI
    setModules(newModules);
    setSaveState("saving");

    const moduleIds = newModules.map((m) => m.id);
    const res = await reorderModules(moduleIds);
    if (res.success) {
      toast.success("Cập nhật thứ tự chương học thành công!");
      setSaveState("saved");
    } else {
      toast.error(res.error || "Lỗi cập nhật thứ tự chương học.");
      setSaveState("error");
    }

    setDraggedModuleId(null);
    setIsDraggableModuleId(null);
  };

  const handleReorderLessons = async (moduleId: string, lessonIds: string[]) => {
    setSaveState("saving");
    
    // Update local React state optimistically
    const updatedModules = modules.map((m) => {
      if (m.id === moduleId) {
        const sortedLessons = [...m.lessons].sort((a, b) => {
          return lessonIds.indexOf(a.id) - lessonIds.indexOf(b.id);
        });
        return { ...m, lessons: sortedLessons };
      }
      return m;
    });

    setModules(updatedModules);

    const res = await reorderLessons(lessonIds);
    if (res.success) {
      toast.success("Cập nhật thứ tự bài giảng thành công!");
      setSaveState("saved");
    } else {
      toast.error(res.error || "Lỗi cập nhật thứ tự bài giảng.");
      setSaveState("error");
    }
  };

  // Dialog state
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Add Module
  const handleAddModule = async (title: string, description: string) => {
    setSaveState("saving");
    const res = await createModule(course.id, title, description, modules.length);
    if (res.success && res.module) {
      toast.success("Tạo chương học thành công!");
      const newMod: Module = {
        id: res.module.id,
        courseId: course.id,
        title: res.module.title,
        description: res.module.description || "",
        orderIndex: res.module.order_index,
        isPublished: res.module.status === "published",
        lessons: [],
        createdAt: res.module.created_at,
      };
      setModules([...modules, newMod]);
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không tạo được chương học.");
      setSaveState("error");
    }
  };

  // Edit Module
  const handleUpdateModule = async (title: string, description: string) => {
    if (!editingModule) return;
    setSaveState("saving");
    const res = await updateModule(editingModule.id, title, description);
    if (res.success) {
      toast.success("Cập nhật chương học thành công!");
      setModules(
        modules.map((m) =>
          m.id === editingModule.id ? { ...m, title, description } : m
        )
      );
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không cập nhật được chương học.");
      setSaveState("error");
    }
    setEditingModule(null);
  };

  // Duplicate Module
  const handleDuplicateModule = async (mod: Module) => {
    setSaveState("saving");
    const res = await createModule(course.id, `${mod.title} (Bản sao)`, mod.description || "", modules.length);
    if (res.success && res.module) {
      toast.success("Nhân bản chương học thành công!");
      const newMod: Module = {
        id: res.module.id,
        courseId: course.id,
        title: res.module.title,
        description: res.module.description || "",
        orderIndex: res.module.order_index,
        isPublished: res.module.status === "published",
        lessons: [],
        createdAt: res.module.created_at,
      };
      setModules([...modules, newMod]);
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không nhân bản được chương học.");
      setSaveState("error");
    }
  };

  // Delete Module
  const handleDeleteModule = async (moduleId: string) => {
    setSaveState("saving");
    const res = await deleteModule(moduleId);
    if (res.success) {
      toast.success("Xóa chương học thành công!");
      setModules(modules.filter((m) => m.id !== moduleId));
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không xóa được chương học.");
      setSaveState("error");
    }
  };

  // Add Lesson to Module
  const handleAddLesson = async (moduleId: string, title: string, lessonType: LessonType) => {
    setSaveState("saving");
    const targetModule = modules.find((m) => m.id === moduleId);
    if (!targetModule) return;

    const res = await createLesson(moduleId, course.id, title, lessonType, targetModule.lessons.length);
    if (res.success && res.lesson) {
      toast.success("Thêm bài học thành công!");
      const newL: Lesson = {
        id: res.lesson.id,
        moduleId: res.lesson.module_id,
        title: res.lesson.title,
        slug: res.lesson.slug,
        description: res.lesson.description || "",
        thumbnailUrl: res.lesson.thumbnail_url || "",
        lessonType: res.lesson.lesson_type as LessonType,
        durationSeconds: res.lesson.duration_seconds || 0,
        status: res.lesson.status,
        isFreePreview: res.lesson.is_preview,
        isRequired: res.lesson.is_required,
        video: null,
        contentMarkdown: "",
        orderIndex: res.lesson.order_index,
        resources: [],
        transcriptSegments: [],
        checklist: [],
        quiz: null,
        assignment: null,
        accessRule: { type: "immediate", value: "" },
        createdAt: res.lesson.created_at,
        updatedAt: res.lesson.updated_at,
      };
      setModules(
        modules.map((m) =>
          m.id === moduleId ? { ...m, lessons: [...m.lessons, newL] } : m
        )
      );
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không tạo được bài học.");
      setSaveState("error");
    }
  };

  // Toggle Lesson Publish
  const handleToggleLessonPublish = async (lessonId: string) => {
    let currentStatus = "draft";
    modules.forEach((m) => {
      const l = m.lessons.find((les) => les.id === lessonId);
      if (l) currentStatus = l.status;
    });

    const nextStatus = currentStatus === "published" ? "draft" : "published";
    setSaveState("saving");
    const res = await updateLesson(lessonId, { status: nextStatus });
    if (res.success) {
      toast.success("Cập nhật trạng thái bài học thành công!");
      setModules(
        modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, status: nextStatus } : l
          ),
        }))
      );
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không cập nhật được trạng thái.");
      setSaveState("error");
    }
  };

  // Toggle Lesson Free Preview
  const handleToggleLessonFreePreview = async (lessonId: string) => {
    let currentPreview = false;
    modules.forEach((m) => {
      const l = m.lessons.find((les) => les.id === lessonId);
      if (l) currentPreview = l.isFreePreview;
    });

    setSaveState("saving");
    const res = await updateLesson(lessonId, { isFreePreview: !currentPreview });
    if (res.success) {
      toast.success("Cập nhật chế độ học thử thành công!");
      setModules(
        modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === lessonId ? { ...l, isFreePreview: !currentPreview } : l
          ),
        }))
      );
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không cập nhật được chế độ học thử.");
      setSaveState("error");
    }
  };

  // Duplicate Lesson
  const handleDuplicateLesson = async (lesson: Lesson) => {
    setSaveState("saving");
    const res = await createLesson(lesson.moduleId, course.id, `${lesson.title} (Bản sao)`, lesson.lessonType, 99);
    if (res.success && res.lesson) {
      toast.success("Nhân bản bài học thành công!");
      const newL: Lesson = {
        id: res.lesson.id,
        moduleId: res.lesson.module_id,
        title: res.lesson.title,
        slug: res.lesson.slug,
        description: res.lesson.description || "",
        thumbnailUrl: res.lesson.thumbnail_url || "",
        lessonType: res.lesson.lesson_type as LessonType,
        durationSeconds: res.lesson.duration_seconds || 0,
        status: res.lesson.status,
        isFreePreview: res.lesson.is_preview,
        isRequired: res.lesson.is_required,
        video: null,
        contentMarkdown: "",
        orderIndex: res.lesson.order_index,
        resources: [],
        transcriptSegments: [],
        checklist: [],
        quiz: null,
        assignment: null,
        accessRule: { type: "immediate", value: "" },
        createdAt: res.lesson.created_at,
        updatedAt: res.lesson.updated_at,
      };
      setModules(
        modules.map((m) =>
          m.id === lesson.moduleId ? { ...m, lessons: [...m.lessons, newL] } : m
        )
      );
      setSaveState("saved");
    } else {
      toast.error(res.error || "Lỗi nhân bản bài học.");
      setSaveState("error");
    }
  };

  // Delete Lesson
  const handleDeleteLesson = async (lessonId: string) => {
    setSaveState("saving");
    const res = await deleteLesson(lessonId);
    if (res.success) {
      toast.success("Xóa bài học thành công!");
      setModules(
        modules.map((m) => ({
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId),
        }))
      );
      setSaveState("saved");
    } else {
      toast.error(res.error || "Không xóa được bài học.");
      setSaveState("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${course.id}`}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Về Khóa Học
            </Link>
          </Button>
          <div>
            <h3 className="font-bold text-base text-white">Chương Trình Học: {course.title}</h3>
            <p className="text-xs text-zinc-400">Tổ chức các Chương học và Bài học theo lộ trình.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} />
          <Button variant="outline" size="sm" onClick={() => setAddModuleOpen(true)} className="text-xs">
            <Plus className="w-4 h-4 mr-1" /> Thêm Chương Mới
          </Button>
        </div>
      </div>

      {/* Modules Container */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30 space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-gold-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Chưa có chương học nào</h4>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Bấm nút &quot;Thêm Chương Mới&quot; để bắt đầu xây dựng nội dung bài giảng cho khóa học này.
            </p>
            <Button variant="gold" size="sm" onClick={() => setAddModuleOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Thêm Chương Đầu Tiên
            </Button>
          </div>
        ) : (
          modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              courseId={course.id}
              onEditModule={(m) => setEditingModule(m)}
              onDuplicateModule={handleDuplicateModule}
              onDeleteModule={handleDeleteModule}
              onAddLesson={handleAddLesson}
              onToggleLessonPublish={handleToggleLessonPublish}
              onToggleLessonFreePreview={handleToggleLessonFreePreview}
              onDuplicateLesson={handleDuplicateLesson}
              onDeleteLesson={handleDeleteLesson}
              onReorderLessons={handleReorderLessons}
              draggable={isDraggableModuleId === mod.id}
              onDragStart={(e) => handleDragStartModule(e, mod.id)}
              onDragOver={handleDragOverModule}
              onDrop={(e) => handleDropModule(e, mod.id)}
              onDragEnd={() => setIsDraggableModuleId(null)}
              onMouseDownDrag={() => setIsDraggableModuleId(mod.id)}
              onMouseUpDrag={() => setIsDraggableModuleId(null)}
            />
          ))
        )}
      </div>

      {/* Add Module Dialog */}
      <AddModuleDialog
        isOpen={addModuleOpen}
        onClose={() => setAddModuleOpen(false)}
        onSave={handleAddModule}
      />

      {/* Edit Module Dialog */}
      {editingModule && (
        <AddModuleDialog
          isOpen={!!editingModule}
          onClose={() => setEditingModule(null)}
          onSave={handleUpdateModule}
          initialTitle={editingModule.title}
          initialDescription={editingModule.description}
          isEditing={true}
        />
      )}
    </div>
  );
}
