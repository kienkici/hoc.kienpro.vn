"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseOverviewForm } from "@/components/admin/CourseOverviewForm";
import { createCourse } from "@/server/actions/course";
import { Course } from "@/types/admin";
import { toast } from "sonner";

export default function NewCoursePage() {
  const router = useRouter();

  // Temporary mock data format required by form initial state
  const defaultCourse: Course = {
    id: "",
    slug: "khoa-hoc-moi",
    title: "",
    subtitle: "",
    description: "",
    thumbnailUrl: "",
    previewVideoUrl: "",
    category: "thiet-ke",
    instructorId: "",
    instructorName: "Kiên Pro",
    price: 0,
    salePrice: 0,
    status: "draft",
    accessDurationDays: null,
    enableCertificate: true,
    completionPercentRequired: 80,
    studentCount: 0,
    rating: 5,
    reviewCount: 0,
    highlights: [],
    modules: [],
    createdAt: "",
    updatedAt: "",
  };

  const handleSaveMock = async (data: Partial<Course>) => {
    const res = await createCourse(data);
    if (res.success && res.course) {
      toast.success("Tạo khóa học thành công!");
      router.push(`/admin/courses/${res.course.id}`);
      router.refresh();
    } else {
      toast.error(res.error || "Không tạo được khóa học.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tạo Khóa Học Mới"
        description="Nhập thông tin ban đầu để tạo bản nháp khóa học mới."
      />
      <CourseOverviewForm course={defaultCourse} onSaveMock={handleSaveMock} />
    </div>
  );
}
