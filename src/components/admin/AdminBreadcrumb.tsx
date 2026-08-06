"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_NAME_MAP: Record<string, string> = {
  admin: "Admin",
  dashboard: "Tổng quan",
  courses: "Quản lý Khóa học",
  new: "Tạo khóa học mới",
  curriculum: "Chương trình học",
  settings: "Cài đặt",
  students: "Học viên",
  lessons: "Bài học",
  media: "Thư viện Media",
  orders: "Đơn hàng",
  payments: "Thanh toán",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-zinc-400">
      <Link href="/admin/dashboard" className="hover:text-white flex items-center gap-1 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const name = ROUTE_NAME_MAP[segment] || (segment.length > 15 ? `${segment.slice(0, 12)}...` : segment);

        return (
          <div key={href} className="flex items-center space-x-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-white truncate max-w-[150px]">{name}</span>
            ) : (
              <Link href={href} className="hover:text-white transition-colors truncate max-w-[120px]">
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
