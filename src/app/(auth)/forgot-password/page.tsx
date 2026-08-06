"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction } from "@/server/actions/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setMessage("");

    const res = await forgotPasswordAction({ email });
    if (res.success) {
      setMessage(res.message || "Gửi email khôi phục thành công.");
      toast.success(res.message);
    } else {
      setErrorMsg(res.error || "Gửi thất bại.");
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 space-y-6 shadow-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white">Quên Mật Khẩu</h1>
        <p className="text-xs text-zinc-400">
          Nhập Email của bạn để nhận liên kết khôi phục mật khẩu tài khoản
        </p>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium">
          ✓ {message}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Địa chỉ Email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hocvien@kienpro.com"
            disabled={isLoading || !!message}
          />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={isLoading || !!message}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi...
            </>
          ) : (
            <>Gửi Liên Kết Khôi Phục</>
          )}
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-800 text-center text-xs">
        <Link href="/login" className="text-zinc-400 hover:text-white inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}
