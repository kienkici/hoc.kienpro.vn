"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Layers, Eye, FileText, Image as ImageIcon, Settings, Users, Loader2 } from "lucide-react";
import { getCourseWithCurriculum, updateCourse } from "@/server/actions/course";
import { CourseOverviewForm } from "@/components/admin/CourseOverviewForm";
import { CourseSalesForm } from "@/components/admin/CourseSalesForm";
import { CourseSettingsForm } from "@/components/admin/CourseSettingsForm";
import { CourseStudentsList } from "@/components/admin/CourseStudentsList";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Course } from "@/types/admin";
import { toast } from "sonner";

export default function CourseEditorPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourseData = async () => {
    setIsLoading(true);
    const data: any = await getCourseWithCurriculum(params.courseId);
    if (!data) {
      setIsLoading(false);
      return;
    }

    // Map db schema to frontend structure
    const mapped: Course = {
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
      modules: data.course_modules || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    setCourse(mapped);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourseData();
  }, [params.courseId]);

  const handleUpdateCourse = async (updatedFields: Partial<Course>) => {
    if (!course) return;
    const res = await updateCourse(course.id, updatedFields);
    if (res.success) {
      toast.success("Lưu cấu hình thành công!");
      fetchCourseData();
    } else {
      toast.error(res.error || "Có lỗi xảy ra khi lưu.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
        <span className="text-sm text-zinc-400">Đang tải thông tin khóa học...</span>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={course.title}
        description={`Mã ID: ${course.id} • Slug: /${course.slug}`}
      >
        <StatusBadge status={course.status} />
        <Button variant="outline" size="sm" asChild>
          <Link href={`/courses/${course.slug}`} target="_blank">
            <Eye className="w-4 h-4 mr-1.5" /> Xem trước Public
          </Link>
        </Button>
        <Button variant="gold" size="sm" asChild className="font-bold">
          <Link href={`/admin/courses/${course.id}/curriculum`}>
            <Layers className="w-4 h-4 mr-1.5" /> Chương Trình Học ({course.modules.length} chương)
          </Link>
        </Button>
      </PageHeader>

      {/* COURSE EDITOR TABS */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1 flex-wrap h-auto">
          <TabsTrigger value="overview" className="gap-2 text-xs py-2 px-3">
            <FileText className="w-4 h-4" /> Tổng Quan
          </TabsTrigger>
          <TabsTrigger value="curriculum_link" asChild className="gap-2 text-xs py-2 px-3">
            <Link href={`/admin/courses/${course.id}/curriculum`}>
              <Layers className="w-4 h-4 text-gold-400" /> Chương Trình Học
            </Link>
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2 text-xs py-2 px-3">
            <ImageIcon className="w-4 h-4" /> Nội Dung Bán Hàng
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 text-xs py-2 px-3">
            <Settings className="w-4 h-4" /> Cài Đặt Khóa Học
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2 text-xs py-2 px-3">
            <Users className="w-4 h-4" /> Học Viên ({course.studentCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <CourseOverviewForm course={course} onSaveMock={handleUpdateCourse} />
        </TabsContent>

        <TabsContent value="sales">
          <CourseSalesForm course={course} onSaveMock={handleUpdateCourse} />
        </TabsContent>

        <TabsContent value="settings">
          <CourseSettingsForm course={course} onSaveMock={handleUpdateCourse} />
        </TabsContent>

        <TabsContent value="students">
          <CourseStudentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
