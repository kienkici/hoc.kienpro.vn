"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, FileText, Film, Download, AlignLeft, CheckSquare, HelpCircle, PenTool, Lock, Settings, Loader2 } from "lucide-react";
import { getLessonWithDetails, updateLesson } from "@/server/actions/course";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Lesson } from "@/types/admin";
import { toast } from "sonner";

// 9 Tabs components
import { LessonContentTab } from "@/components/admin/lesson-editor/LessonContentTab";
import { VideoManagerTab } from "@/components/admin/lesson-editor/VideoManagerTab";
import { ResourceManagerTab } from "@/components/admin/lesson-editor/ResourceManagerTab";
import { TranscriptEditorTab } from "@/components/admin/lesson-editor/TranscriptEditorTab";
import { ChecklistBuilderTab } from "@/components/admin/lesson-editor/ChecklistBuilderTab";
import { QuizBuilderTab } from "@/components/admin/lesson-editor/QuizBuilderTab";
import { AssignmentBuilderTab } from "@/components/admin/lesson-editor/AssignmentBuilderTab";
import { AccessRulesTab } from "@/components/admin/lesson-editor/AccessRulesTab";
import { LessonSettingsTab } from "@/components/admin/lesson-editor/LessonSettingsTab";

export default function LessonEditorPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessonData = async () => {
    setIsLoading(true);
    const data: any = await getLessonWithDetails(params.lessonId);
    if (!data) {
      setIsLoading(false);
      return;
    }

    // Map DB structure to frontend type safely
    const mapped: Lesson = {
      id: data.id,
      moduleId: data.module_id,
      title: data.title,
      slug: data.slug,
      description: data.description || "",
      thumbnailUrl: data.thumbnail_url || "",
      lessonType: data.lesson_type,
      contentMarkdown: data.content || "",
      durationSeconds: data.duration_seconds || 0,
      orderIndex: data.order_index,
      status: data.status,
      isFreePreview: data.is_preview,
      isRequired: data.is_required,
      video: data.video_id ? {
        id: data.video_id,
        provider: data.video_provider,
        externalId: data.video_id,
        title: data.title,
        durationSeconds: data.duration_seconds || 0,
        status: data.video_status || "ready",
        thumbnailUrl: data.thumbnail_url || "",
        uploadProgress: 100,
        fileSize: 0,
        resolution: "1080p",
        createdAt: ""
      } : null,
      resources: data.lesson_resources || [],
      transcriptSegments: data.transcript_segments || [],
      checklist: data.checklist_items || [],
      quiz: data.quizzes || null,
      assignment: data.assignments || null,
      accessRule: data.access_rules || { type: "immediate", value: "" },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setLesson(mapped);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLessonData();
  }, [params.lessonId]);

  const handleUpdateLesson = async (updatedFields: Partial<Lesson>) => {
    if (!lesson) return;
    const res = await updateLesson(lesson.id, updatedFields);
    if (res.success) {
      toast.success("Cập nhật bài học thành công!");
      fetchLessonData();
    } else {
      toast.error(res.error || "Không cập nhật được bài học.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        <span className="text-sm text-zinc-400">Đang tải thông tin chi tiết bài học...</span>
      </div>
    );
  }

  if (!lesson) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={lesson.title}
        description={`Mã ID: ${lesson.id} • Slug: /${lesson.slug}`}
      >
        <StatusBadge status={lesson.status} />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/courses/${params.courseId}/curriculum`}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Về Chương Trình Học
          </Link>
        </Button>
      </PageHeader>

      {/* LESSON EDITOR 9 TABS */}
      <Tabs defaultValue="content" className="w-full space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex-wrap h-auto">
          <TabsTrigger value="content" className="gap-1.5 text-xs py-2 px-3">
            <FileText className="w-4 h-4" /> Nội Dung
          </TabsTrigger>
          <TabsTrigger value="video" className="gap-1.5 text-xs py-2 px-3">
            <Film className="w-4 h-4 text-gold-400" /> Video
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5 text-xs py-2 px-3">
            <Download className="w-4 h-4" /> Tài Liệu ({lesson.resources.length})
          </TabsTrigger>
          <TabsTrigger value="checklist" className="gap-1.5 text-xs py-2 px-3">
            <CheckSquare className="w-4 h-4" /> Checklist ({lesson.checklist.length})
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-1.5 text-xs py-2 px-3">
            <HelpCircle className="w-4 h-4 text-amber-400" /> Quiz
          </TabsTrigger>
          <TabsTrigger value="assignment" className="gap-1.5 text-xs py-2 px-3">
            <PenTool className="w-4 h-4" /> Bài Tập
          </TabsTrigger>
          <TabsTrigger value="access" className="gap-1.5 text-xs py-2 px-3">
            <Lock className="w-4 h-4" /> Điều Kiện Mở
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5 text-xs py-2 px-3">
            <Settings className="w-4 h-4" /> Cài Đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <LessonContentTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="video">
          <VideoManagerTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="resources">
          <ResourceManagerTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistBuilderTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="quiz">
          <QuizBuilderTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="assignment">
          <AssignmentBuilderTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="access">
          <AccessRulesTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>

        <TabsContent value="settings">
          <LessonSettingsTab lesson={lesson} onSaveMock={handleUpdateLesson} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
