"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPasswordAction } from "@/server/actions/auth";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    setMessage("");

    const res = await resetPasswordAction({ password });
    if (res.success) {
      setMessage(res.message || "Đặt lại mật khẩu thành công.");
      toast.success(res.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setErrorMsg(res.error || "Có lỗi xảy ra.");
      toast.error(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 space-y-6 shadow-2xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-white">Đặt Lại Mật Khẩu</h1>
        <p className="text-xs text-zinc-400">
          Nhập mật khẩu mới cho tài khoản KIENPRO LMS của bạn
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
          <label className="text-xs font-semibold text-zinc-300">Mật khẩu mới</label>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isLoading || !!message}
          />
        </div>

        <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={isLoading || !!message}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang cập nhật...
            </>
          ) : (
            <>Cập Nhật Mật Khẩu</>
          )}
        </Button>
      </form>
    </div>
  );
}
