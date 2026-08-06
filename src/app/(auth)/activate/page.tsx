"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ActivatePage() {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 space-y-6 text-center shadow-2xl">
      <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
        <ShieldCheck className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Xác Thực Liên Kết Kích Hoạt</h1>
        <p className="text-xs text-zinc-300 leading-relaxed">
          Email: <strong className="text-white">hocvien.kienpro@gmail.com</strong>.
          <br />
          Token kích hoạt an toàn hợp lệ (Thời hạn 72 giờ).
        </p>
      </div>

      <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400">
        🔒 Bạn đang kích hoạt tài khoản lần đầu cho thương hiệu Kiên Pro. Vui lòng đặt mật khẩu cá nhân ở bước tiếp theo.
      </div>

      <Button
        variant="gold"
        size="lg"
        onClick={() => router.push("/set-password")}
        className="w-full font-bold"
      >
        Đặt Mật Khẩu Lần Đầu <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
