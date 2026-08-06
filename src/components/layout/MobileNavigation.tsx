"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();

  const navItems = [
    { title: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { title: "Khóa học", href: "/my-courses", icon: BookOpen },
    { title: "Ghi chú", href: "/notes", icon: FileText },
    { title: "Hồ sơ", href: "/profile", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
              isActive ? "text-gold-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive && "text-gold-400")} />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
