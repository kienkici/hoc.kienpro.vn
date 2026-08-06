"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, ShieldCheck, Clock, CheckCircle2, Copy, ArrowLeft } from "lucide-react";
import { MOCK_COURSES } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_CONFIG, MOCK_NOTICES } from "@/lib/constants";
import { getCourseByIdOrSlug, createOrder } from "@/server/actions/course";

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"form" | "qr">("form");
  const [orderCode, setOrderCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes = 900 seconds

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (step !== "qr") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    async function loadCourse() {
      try {
        const data = await getCourseByIdOrSlug(params.courseId);
        if (data) {
          setCourse({
            id: data.id,
            title: data.title,
            slug: data.slug,
            price: Number(data.original_price),
            salePrice: Number(data.sale_price),
            thumbnailUrl: data.thumbnail_url || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
            instructorName: "Kiên Pro",
          });
        } else {
          // Fallback to first mock course if slug/id not found in DB
          setCourse(MOCK_COURSES[0]);
        }
      } catch (err) {
        console.error("Error loading course for checkout:", err);
        setCourse(MOCK_COURSES[0]);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
  }, [params.courseId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;

    setIsSubmitting(true);
    try {
      const res = await createOrder({
        courseId: course.id,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        amount: course.salePrice,
      });

      if (res.success && res.order) {
        setOrderCode(res.order.code);
        setStep("qr");
      } else {
        alert(res.error || "Không tạo được đơn hàng. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối cơ sở dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaid = () => {
    router.push("/checkout/success");
  };

  const handleSimulateFailed = () => {
    router.push("/checkout/failed");
  };

  if (loading || !course) {
    return (
      <div className="py-24 max-w-4xl mx-auto px-4 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 text-xs">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

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

                <Button type="submit" variant="gold" size="lg" className="w-full font-bold" disabled={isSubmitting}>
                  {isSubmitting ? "Đang khởi tạo đơn hàng..." : "Tiếp Tục Thanh Toán VietQR"}
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-xl border border-gold-500/40 bg-zinc-900/90 p-6 space-y-6 text-center">
              <div className="flex justify-between items-center text-xs text-zinc-400 pb-3 border-b border-zinc-800">
                <span>Mã đơn hàng: <strong className="text-gold-400">{orderCode}</strong></span>
                <Badge variant="warning" className="animate-pulse">Đang chờ quét QR</Badge>
              </div>

              {/* VietQR Display */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Quét Mã QR Bằng App Ngân Hàng</h3>
                <div className="w-56 h-56 mx-auto bg-white p-3 rounded-xl shadow-2xl flex items-center justify-center">
                  {/* VietQR Image */}
                  <img
                    src={`https://img.vietqr.io/image/${APP_CONFIG.bankAccount.bankId}-${APP_CONFIG.bankAccount.accountNumber}-compact.png?amount=${course.salePrice}&addInfo=${orderCode}&accountName=${encodeURIComponent(APP_CONFIG.bankAccount.accountName)}`}
                    alt="VietQR Standard"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold-400" /> Thời gian chờ: <strong className="text-white">{formatTime(timeLeft)}</strong>
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
                  <strong className="text-gold-400 font-mono text-sm">{orderCode}</strong>
                </div>
              </div>

              {/* MOCK ACTIONS FOR TESTER */}
              {process.env.NODE_ENV === "development" && (
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
              )}
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
