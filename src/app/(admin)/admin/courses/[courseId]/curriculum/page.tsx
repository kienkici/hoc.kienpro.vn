"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCourseWithCurriculum, createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson } from "@/server/actions/course";
import { CurriculumBuilder } from "@/components/admin/CurriculumBuilder";
import { Course, Module, Lesson, LessonType } from "@/types/admin";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CourseCurriculumPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurriculum = async () => {
    setIsLoading(true);
    const data: any = await getCourseWithCurriculum(params.courseId);
    if (!data) {
      setIsLoading(false);
      return;
    }

    // Map DB structures to frontend types
    const mappedModules = (data.course_modules || []).map((m: any) => ({
      id: m.id,
      courseId: m.course_id,
      title: m.title,
      description: m.description || "",
      orderIndex: m.order_index,
      isPublished: m.status === "published",
      lessons: (m.lessons || []).map((l: any) => ({
        id: l.id,
        moduleId: l.module_id,
        title: l.title,
        slug: l.slug,
        description: l.description || "",
        thumbnailUrl: l.thumbnail_url || "",
        lessonType: l.lesson_type,
        durationSeconds: l.duration_seconds || 0,
        status: l.status,
        isFreePreview: l.is_preview,
        isRequired: l.is_required,
        video: l.video_id ? { provider: l.video_provider, externalId: l.video_id, status: l.video_status } : null,
      })).sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)),
    })).sort((a: any, b: any) => a.orderIndex - b.orderIndex);

    const mappedCourse: Course = {
      id: data.id,
      slug: data.slug,
      title: data.title,
      subtitle: data.short_description || "",
      description: data.description || "",
      thumbnailUrl: data.thumbnail_url || "",
      previewVideoUrl: data.intro_video_id || "",
      category: data.category,
      instructorId: data.instructor_id || "",
      instructorName: "Kiên Pro",
      price: Number(data.original_price),
      salePrice: Number(data.sale_price),
      status: data.status,
      accessDurationDays: data.access_duration_days,
      enableCertificate: data.certificate_enabled,
      completionPercentRequired: data.completion_percentage,
      studentCount: data.studentCount || 0,
      rating: 5,
      reviewCount: 0,
      highlights: data.highlights || [],
      modules: mappedModules,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setCourse(mappedCourse);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCurriculum();
  }, [params.courseId]);

  const handleSaveModulesMock = async (updatedModules: Module[]) => {
    // Save all module title/description edits to database
    toast.info("Đang đồng bộ hóa lộ trình với Supabase...");
    fetchCurriculum();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        <span className="text-sm text-zinc-400">Đang tải cấu trúc chương trình học...</span>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Chương Trình Học: ${course.title}`}
        description="Quản lý cấu trúc các chương và danh sách bài giảng."
      />
      <CurriculumBuilder course={course} onSaveMock={handleSaveModulesMock} />
    </div>
  );
}
