"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { CourseListToolbar } from "@/components/admin/CourseListToolbar";
import { CourseTable } from "@/components/admin/CourseTable";
import { CourseCard } from "@/components/course/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { getCoursesList, updateCourse, softDeleteCourse, createCourse } from "@/server/actions/course";
import { Course } from "@/types/admin";
import { toast } from "sonner";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Confirm dialog state
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    const data = await getCoursesList();
    // Map db schema to frontend type safely
    const mapped = (data || []).map((c: any) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      subtitle: c.short_description,
      description: c.description,
      thumbnailUrl: c.thumbnail_url,
      price: Number(c.original_price),
      salePrice: Number(c.sale_price),
      status: c.status,
      studentCount: c.studentCount || 0,
      rating: c.rating || 5.0,
      reviewCount: c.reviewCount || 0,
      highlights: c.highlights || [],
      modules: (c.course_modules || []).map((m: any) => ({
        id: m.id,
        lessons: m.lessons || []
      })),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
    setCourses(mapped as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Toggle publish/unpublish
  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    const res = await updateCourse(id, { status: nextStatus });
    if (res.success) {
      toast.success("Cập nhật trạng thái thành công!");
      fetchCourses();
    } else {
      toast.error(res.error || "Không cập nhật được trạng thái.");
    }
  };

  // Duplicate course
  const handleDuplicate = async (course: Course) => {
    const newSlug = `${course.slug}-copy-${Date.now().toString(36)}`;
    const res = await createCourse({
      title: `${course.title} (Bản sao)`,
      slug: newSlug,
      subtitle: course.subtitle,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      category: course.category,
      price: course.price,
      salePrice: course.salePrice,
    });

    if (res.success) {
      toast.success("Nhân bản khóa học thành công!");
      fetchCourses();
    } else {
      toast.error(res.error || "Không nhân bản được khóa học.");
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingCourse) return;
    const res = await softDeleteCourse(deletingCourse.id);
    if (res.success) {
      toast.success("Xóa khóa học thành công!");
      fetchCourses();
    } else {
      toast.error(res.error || "Lỗi khi xóa khóa học.");
    }
    setDeletingCourse(null);
  };

  // Filter & Sort Logic
  const filteredCourses = courses
    .filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchCategory = categoryFilter === "all" || c.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "students") return b.studentCount - a.studentCount;
      if (sortBy === "price-asc") return a.salePrice - b.salePrice;
      if (sortBy === "price-desc") return b.salePrice - a.salePrice;
      return 0;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Khóa Học"
        description="Tạo mới, chỉnh sửa nội dung bài giảng, học phí và xuất bản khóa học."
      >
        <Button variant="gold" size="sm" asChild>
          <Link href="/admin/courses/new">
            <Plus className="w-4 h-4 mr-1.5" /> Tạo Khóa Học Mới
          </Link>
        </Button>
      </PageHeader>

      {/* TOOLBAR */}
      <CourseListToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* CONTENT */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
          <span className="text-sm text-zinc-400">Đang tải danh sách khóa học...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          title="Không tìm thấy khóa học nào"
          description="Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc trạng thái để xem kết quả."
          actionText="Tạo Khóa Học Mới"
          actionHref="/admin/courses/new"
        />
      ) : viewMode === "table" ? (
        <CourseTable
          courses={filteredCourses}
          onTogglePublish={handleTogglePublish}
          onDuplicate={handleDuplicate}
          onDeleteRequest={setDeletingCourse}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course as any} />
          ))}
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận lưu trữ khóa học"
        description={`Bạn có chắc chắn muốn chuyển khóa học "${deletingCourse?.title}" sang trạng thái Lưu trữ (Soft Delete)?`}
        confirmText="Xóa Khóa Học"
        variant="destructive"
      />
    </div>
  );
}
