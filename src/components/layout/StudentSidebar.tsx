"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bookmark,
  User,
  HelpCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { STUDENT_NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_CURRENT_USER } from "@/lib/mock-data";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  FileText,
  Bookmark,
  User,
  HelpCircle,
};

export function StudentSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between h-screen sticky top-0 shrink-0 hidden md:flex">
      {/* Top Header & Brand */}
      <div>
        <div className="p-6 border-b border-zinc-800/80">
          <Logo />
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {STUDENT_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon || ""] || BookOpen;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-gold-500/10 text-gold-400 font-semibold border border-gold-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-gold-400" : "text-zinc-400 group-hover:text-zinc-200"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Footer */}
      <div className="p-4 border-t border-zinc-800/80 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <Avatar className="w-9 h-9">
            <AvatarImage src={MOCK_CURRENT_USER.avatarUrl} />
            <AvatarFallback>TV</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-white truncate">
              {MOCK_CURRENT_USER.fullName}
            </span>
            <span className="text-[11px] text-zinc-400 truncate">
              {MOCK_CURRENT_USER.email}
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-400 px-3 py-2 rounded-md hover:bg-zinc-900 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </Link>
      </div>
    </aside>
  );
}
