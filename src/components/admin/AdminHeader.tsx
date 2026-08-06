"use client";

import Link from "next/link";
import { Bell, Shield, LogOut, ExternalLink } from "lucide-react";
import { AdminBreadcrumb } from "./AdminBreadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MOCK_ADMIN_USER } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function AdminHeader() {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs */}
      <AdminBreadcrumb />

      {/* Right: Actions, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* View Main Site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-zinc-900 transition-colors"
        >
          <span>Xem Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* Notifications Popover */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 bg-zinc-900 border-zinc-800 text-zinc-200 p-2 space-y-1">
            <DropdownMenuLabel className="text-xs font-semibold text-white flex justify-between items-center">
              Thông báo mới
              <Badge variant="gold" className="text-[9px] py-0">3 mới</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="text-xs space-y-2 py-1">
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
                <p className="font-semibold text-gold-400">Đơn hàng KP98241 đã thanh toán</p>
                <p className="text-[10px] text-zinc-400">Học viên Trần Văn Nam • 1.490.000đ</p>
              </div>
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 space-y-0.5">
                <p className="font-semibold text-white">SePay Webhook callback thành công</p>
                <p className="text-[10px] text-zinc-400">Anti-replay Idempotency key verified</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 border-l border-zinc-800 outline-none">
              <Avatar className="w-8 h-8">
                <AvatarImage src={MOCK_ADMIN_USER.avatarUrl} />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-bold text-white leading-tight">
                  {MOCK_ADMIN_USER.fullName}
                </span>
                <span className="text-[10px] text-amber-400 leading-tight">Super Admin</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800 text-zinc-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-white">
                  {MOCK_ADMIN_USER.fullName}
                </p>
                <p className="text-xs leading-none text-zinc-400">
                  {MOCK_ADMIN_USER.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="cursor-pointer">
                <Shield className="mr-2 h-4 w-4 text-amber-400" />
                Cấu hình Admin
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link href="/login" className="cursor-pointer text-red-400 focus:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Thoát Admin
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
