"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  BookMarked,
  Users,
  ShoppingCart,
  CreditCard,
  ShieldAlert,
  LogOut,
  FileVideo,
  Settings,
} from "lucide-react";
import { ADMIN_NAV_ITEMS } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  BookMarked,
  Users,
  ShoppingCart,
  CreditCard,
  FileVideo,
  Settings,
};

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col justify-between h-screen sticky top-0 shrink-0 hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <Logo showText={true} />
          <Badge variant="gold" className="text-[10px] uppercase">Admin</Badge>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 pb-2">
            Quản trị Hệ thống
          </div>
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon || ""] || TrendingUp;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-amber-400" : "text-zinc-400 group-hover:text-zinc-200"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Footer info */}
      <div className="p-4 border-t border-zinc-800/80 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-white truncate">
              Super Admin Mode
            </span>
            <span className="text-[10px] text-zinc-400">
              Kiên Pro Management
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-400 px-3 py-2 rounded-md hover:bg-zinc-900 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Thoát Admin</span>
        </Link>
      </div>
    </aside>
  );
}
