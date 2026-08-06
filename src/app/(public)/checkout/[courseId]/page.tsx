"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, ShieldCheck, Clock, CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { MOCK_COURSES, MOCK_ORDERS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG, MOCK_NOTICES } from "@/lib/constants";

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];
  const [step, setStep] = useState<"form" | "qr">("form");

  const [form, setForm] = useState({
    name: "Trần Văn Nam",
    email: "hocvien.kienpro@gmail.com",
    phone: "0987.654.321",
  });

  const mockOrderCode = "KP98241";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("qr");
  };

  const handleSimulatePaid = () => {
    // Demo Mock redirect to success page
    router.push("/checkout/success");
  };

  const handleSimulateFailed = () => {
    router.push("/checkout/failed");
  };

  return (
    <div className="py-12 container max-w-4xl mx-auto px-4 space-y-8">
      {/* Mock Notice Bar */}
      <div className="p-3 rounded-lg border border-gold-500/30 bg-gold-500/10 text-xs text-gold-300 text-center font-medium">
        {MOCK_NOTICES.noticeText}
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <button onClick={() => router.back()} className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Form / QR Code */}
        <div className="space-y-6">
          {step === "form" ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-6">
              <h2 className="text-xl font-bold text-white">1. Điền Thông Tin Nhận Khóa Học</h2>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">Họ và tên *</label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">Email nhận kích hoạt *</label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nguyenvana@gmail.com"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Link tạo mật khẩu kích hoạt tài khoản sẽ gửi về Email này ngay sau khi nhận tiền.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">Số điện thoại / Zalo *</label>
                  <Input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0912345678"
                  />
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full font-bold">
                  Tiếp Tục Thanh Toán VietQR
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-xl border border-gold-500/40 bg-zinc-900/90 p-6 space-y-6 text-center">
              <div className="flex justify-between items-center text-xs text-zinc-400 pb-3 border-b border-zinc-800">
                <span>Mã đơn hàng: <strong className="text-gold-400">{mockOrderCode}</strong></span>
                <Badge variant="warning" className="animate-pulse">Đang chờ quét QR</Badge>
              </div>

              {/* VietQR Display */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Quét Mã QR Bằng App Ngân Hàng</h3>
                <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl shadow-2xl flex items-center justify-center">
                  {/* Mock VietQR Image */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=STK:${APP_CONFIG.bankAccount.accountNumber}-NOIDUNG:${mockOrderCode}-SOTIEN:${course.salePrice}`}
                    alt="VietQR Demo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold-400" /> Thời gian chờ: <strong className="text-white">14:59</strong>
                </div>
              </div>

              {/* Bank Details Table */}
              <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Ngân hàng:</span>
                  <strong className="text-white">{APP_CONFIG.bankAccount.bankName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Số tài khoản:</span>
                  <strong className="text-gold-400 font-mono">{APP_CONFIG.bankAccount.accountNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Chủ tài khoản:</span>
                  <strong className="text-white">{APP_CONFIG.bankAccount.accountName}</strong>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2">
                  <span className="text-zinc-400">Nội dung chuyển:</span>
                  <strong className="text-gold-400 font-mono text-sm">{mockOrderCode}</strong>
                </div>
              </div>

              {/* MOCK ACTIONS FOR TESTER */}
              <div className="pt-4 border-t border-zinc-800 space-y-2">
                <p className="text-[11px] text-zinc-400 font-semibold">
                  [DEMO TESTER ACTIONS - GIẢ LẬP KẾT QUẢ WEBHOOK]
                </p>
                <div className="flex gap-2">
                  <Button variant="gold" size="sm" onClick={handleSimulatePaid} className="flex-1 text-xs">
                    Giả lập Webhook Thành Công
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleSimulateFailed} className="flex-1 text-xs">
                    Giả lập Thất Bại
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-6">
          <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-3">Tóm Tắt Đơn Hàng</h3>
          <div className="flex gap-3 items-center">
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-20 h-14 rounded-lg object-cover border border-zinc-800"
            />
            <div>
              <h4 className="text-xs font-bold text-white line-clamp-2">{course.title}</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Giảng viên: {course.instructorName}</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-4 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Giá niêm yết:</span>
              <span className="line-through">{formatCurrency(course.price)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Ưu đãi VietQR Instant:</span>
              <span className="text-gold-400">-{formatCurrency(course.price - course.salePrice)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-3">
              <span>Tổng thanh toán:</span>
              <span className="text-gold-400 text-base">{formatCurrency(course.salePrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
