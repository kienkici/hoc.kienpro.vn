"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { loginAction } from "@/server/actions/auth";
import { MOCK_NOTICES } from "@/lib/constants";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const res = await loginAction({ email, password });
    if (res.success) {
      toast.success("Đăng nhập thành công!");
      router.push(redirect);
      router.refresh();
    } else {
      setErrorMsg(res.error || "Có lỗi xảy ra khi đăng nhập.");
      toast.error(res.error || "Đăng nhập thất bại.");
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 space-y-6 shadow-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white">Đăng Nhập Hệ Thống</h1>
        <p className="text-xs text-zinc-400">
          Nhập Email và Mật khẩu để bắt đầu học tập và quản lý
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Địa chỉ Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hocvien@kienpro.com"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-300">Mật khẩu</label>
            <Link href="/forgot-password" className="text-[11px] text-gold-400 hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...
            </>
          ) : (
            <>
              Đăng Nhập Vào Học <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400 space-y-2">
        <p>Chưa có tài khoản?</p>
        <Link href="/#courses" className="text-gold-400 hover:underline font-semibold">
          Đăng ký mua khóa học để nhận quyền truy cập tự động
        </Link>
      </div>
    </div>
  );
}
