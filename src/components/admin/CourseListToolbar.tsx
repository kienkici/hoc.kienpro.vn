"use client";

import { Search, LayoutGrid, LayoutList, Plus, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { CATEGORY_MAP, CourseCategory, CourseStatus } from "@/types/admin";

interface CourseListToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
}

export function CourseListToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
}: CourseListToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên khóa học, mã slug..."
          className="pl-9 bg-zinc-950 border-zinc-800 text-xs"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Select */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[130px] h-9 text-xs bg-zinc-950 border-zinc-800">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="draft">Bản nháp</SelectItem>
            <SelectItem value="archived">Đã lưu trữ</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Select */}
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-[150px] h-9 text-xs bg-zinc-950 border-zinc-800">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {Object.entries(CATEGORY_MAP).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Select */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs bg-zinc-950 border-zinc-800">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>

            <SelectItem value="students">Nhiều học viên</SelectItem>
            <SelectItem value="price-asc">Giá thấp -&gt; cao</SelectItem>
            <SelectItem value="price-desc">Giá cao -&gt; thấp</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle Buttons */}
        <div className="flex border border-zinc-800 rounded-lg p-0.5 bg-zinc-950">
          <button
            onClick={() => onViewModeChange("table")}
            className={`p-1.5 rounded ${viewMode === "table" ? "bg-zinc-800 text-gold-400" : "text-zinc-400 hover:text-white"}`}
            title="Dạng Bảng"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("card")}
            className={`p-1.5 rounded ${viewMode === "card" ? "bg-zinc-800 text-gold-400" : "text-zinc-400 hover:text-white"}`}
            title="Dạng Thẻ (Card)"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Create Button */}
        <Button variant="gold" size="sm" asChild className="font-bold">
          <Link href="/admin/courses/new">
            <Plus className="w-4 h-4 mr-1" /> Tạo Mới
          </Link>
        </Button>
      </div>
    </div>
  );
}
