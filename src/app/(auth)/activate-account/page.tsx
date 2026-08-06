"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { activateAccountAction } from "@/server/actions/auth";
import { toast } from "sonner";

export default function ActivateAccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("Mã kích hoạt bị thiếu trên đường dẫn.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setMessage("");

    const res = await activateAccountAction({ token, password });
    if (res.success) {
      setMessage(res.message || "Tài khoản kích hoạt thành công!");
      toast.success(res.message);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } else {
      setErrorMsg(res.error || "Không kích hoạt được tài khoản.");
      toast.error(res.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 space-y-6 text-center shadow-2xl max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Kích Hoạt Tài Khoản</h1>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Tài khoản học viên của bạn đã sẵn sàng. Vui lòng thiết lập mật khẩu cá nhân lần đầu để bắt đầu học tập.
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

      {!token ? (
        <div className="text-xs text-red-400">
          Mã token kích hoạt không tìm thấy. Vui lòng kiểm tra email kích hoạt của bạn.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Nhập Mật khẩu mới</label>
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
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang kích hoạt...
              </>
            ) : (
              <>
                Kích Hoạt Tài Khoản <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
