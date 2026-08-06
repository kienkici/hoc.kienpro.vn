"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Course } from "@/types/admin";
import { courseOverviewSchema, CourseOverviewSchemaType } from "@/server/validators/course";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIndicator, SaveState } from "./SaveIndicator";
import { CATEGORY_MAP } from "@/types/admin";
import { Save } from "lucide-react";

interface CourseOverviewFormProps {
  course: Course;
  onSaveMock: (updated: Partial<Course>) => void;
}

export function CourseOverviewForm({ course, onSaveMock }: CourseOverviewFormProps) {
  const [saveState, setSaveState] = useState<SaveState>("saved");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<CourseOverviewSchemaType>({
    resolver: zodResolver(courseOverviewSchema),
    defaultValues: {
      title: course.title,
      slug: course.slug,
      subtitle: course.subtitle || "",
      description: course.description || "",
      category: course.category,
      price: course.price,
      salePrice: course.salePrice,
      status: course.status,
    },
  });

  const onSubmit = (data: CourseOverviewSchemaType) => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock(data as Partial<Course>);
      setSaveState("saved");
    }, 600);
  };

  // Title change -> Auto slug generator
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val, { shouldValidate: true, shouldDirty: true });
    setSaveState("unsaved");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-bold text-white">1. Thông Tin Tổng Quan Khóa Học</h3>
        <SaveIndicator state={isDirty && saveState === "saved" ? "unsaved" : saveState} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-300">Tên khóa học *</label>
          <Input
            {...register("title")}
            onChange={handleTitleChange}
            placeholder="Khóa học Thiết kế Website AI 2026"
            error={errors.title?.message}
          />
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Đường dẫn Slug (URL) *</label>
          <Input
            {...register("slug")}
            onChange={() => setSaveState("unsaved")}
            placeholder="thiet-ke-website-ai"
            error={errors.slug?.message}
          />
          <p className="text-[11px] text-zinc-500">
            Link công khai: <code>https://lms.kienpro.com/courses/{watch("slug")}</code>
          </p>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Danh mục *</label>
          <Select
            defaultValue={course.category}
            onValueChange={(val) => {
              setValue("category", val as any, { shouldDirty: true });
              setSaveState("unsaved");
            }}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
              {Object.entries(CATEGORY_MAP).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && <p className="text-xs text-red-400 mt-1">{errors.category.message}</p>}
        </div>

        {/* Subtitle */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-300">Mô tả ngắn (Subtitle)</label>
          <Input
            {...register("subtitle")}
            onChange={() => setSaveState("unsaved")}
            placeholder="Xây dựng website bán hàng cao cấp, tích hợp Chatbot AI"
            error={errors.subtitle?.message}
          />
        </div>

        {/* Full Description */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-xs font-semibold text-zinc-300">Mô tả chi tiết</label>
          <Textarea
            {...register("description")}
            onChange={() => setSaveState("unsaved")}
            rows={5}
            placeholder="Mô tả toàn bộ lộ trình và giá trị khóa học mang lại..."
            error={errors.description?.message}
          />
        </div>

        {/* Price & Sale Price */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Giá niêm yết (VND) *</label>
          <Input
            type="number"
            {...register("price")}
            onChange={() => setSaveState("unsaved")}
            error={errors.price?.message}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Giá bán ưu đãi VietQR (VND) *</label>
          <Input
            type="number"
            {...register("salePrice")}
            onChange={() => setSaveState("unsaved")}
            error={errors.salePrice?.message}
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Trạng thái xuất bản *</label>
          <Select
            defaultValue={course.status}
            onValueChange={(val) => {
              setValue("status", val as any, { shouldDirty: true });
              setSaveState("unsaved");
            }}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
              <SelectItem value="draft">Bản nháp (Draft)</SelectItem>
              <SelectItem value="published">Đã xuất bản (Published)</SelectItem>
              <SelectItem value="archived">Đã lưu trữ (Archived)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button type="submit" variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Thông Tin
        </Button>
      </div>
    </form>
  );
}
