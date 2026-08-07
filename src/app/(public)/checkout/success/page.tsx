"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "email học viên";
  const code = searchParams.get("code") || "KPXXXXX";
  const token = searchParams.get("token") || "";

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-xl mx-auto">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Thanh Toán Thành Công!</h1>
        <p className="text-sm text-zinc-300 leading-relaxed">
          Hệ thống KIENPRO LMS đã ghi nhận giao dịch chuyển khoản. Đơn hàng <strong className="text-gold-400">{code}</strong> đã được xử lý tự động.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-left text-xs space-y-3 w-full">
        <div className="flex items-center gap-3 text-gold-400 font-semibold">
          <Mail className="w-5 h-5" />
          <span>Kiểm tra Email để Kích hoạt tài khoản</span>
        </div>
        <p className="text-zinc-400 leading-relaxed">
          Chúng tôi đã gửi một Email chứa liên kết kích hoạt đến địa chỉ <strong className="text-white">{email}</strong>. Vui lòng mở Email và bấm nút đặt mật khẩu lần đầu để vào học ngay.
        </p>
      </div>

      {token && (
        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
          <Button variant="gold" size="lg" asChild className="w-full">
            <Link href={`/activate-account?token=${token}`}>
              Đi Tới Trang Kích Hoạt Ngay <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
