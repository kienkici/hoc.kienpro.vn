import Link from "next/link";
import { XCircle, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutFailedPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-xl mx-auto">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
        <XCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">Thanh Toán Chưa Hoàn Tất</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Giao dịch chưa được xác nhận hoặc đã hết thời gian chờ 15 phút. Mã đơn hàng: <strong className="text-zinc-200">KP98241</strong>.
        </p>
      </div>

      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-left text-xs space-y-2 w-full">
        <h4 className="font-semibold text-white">Lý do có thể xảy ra:</h4>
        <ul className="list-disc list-inside text-zinc-400 space-y-1">
          <li>Số tiền chuyển không khớp chính xác với hóa đơn</li>
          <li>Nội dung chuyển khoản thiếu mã đơn hàng KP98241</li>
          <li>Hệ thống ngân hàng đang bảo trì chuyển khoản nhanh</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full">
        <Button variant="gold" size="lg" asChild className="w-full">
          <Link href="/#courses">
            <RefreshCw className="w-4 h-4 mr-2" /> Thử Thanh Toán Lại
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild className="w-full">
          <Link href="/support">
            <HelpCircle className="w-4 h-4 mr-2" /> Liên Hệ Hỗ Trợ CSKH
          </Link>
        </Button>
      </div>
    </div>
  );
}
