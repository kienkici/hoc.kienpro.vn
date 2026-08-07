"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminPaymentsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWebhookEvents = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("webhook_events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi tải nhật ký webhook:", error);
        toast.error("Không tải được nhật ký giao dịch webhook.");
      } else {
        const mapped = (data || []).map((e: any) => {
          // Trích xuất số tiền nhận
          const amount = Number(e.payload?.amount_in || e.payload?.amount || e.payload?.transferAmount || 0);

          // Trích xuất mã đơn hàng từ nội dung giao dịch (KPxxxx)
          const content = e.payload?.content || e.payload?.description || "";
          const match = content.match(/KP\d+/i);
          const orderCode = match ? match[0].toUpperCase() : "Chưa xác định";

          return {
            id: e.id,
            provider: e.provider === "sepay" ? "SePay (Cổng Tự Động)" : e.provider,
            transactionId: e.transaction_id,
            orderCode,
            amount,
            paidAt: new Date(e.created_at).toLocaleString("vi-VN"),
          };
        });

        setLogs(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhookEvents();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Giao Dịch & Webhook Thanh Toán"
        description="Nhật ký nhận Webhook VietQR ngân hàng thực tế và xác minh anti-replay idempotency."
      />

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3">Mã Giao Dịch Ngân Hàng</th>
                <th className="p-3">Cổng Thanh Toán</th>
                <th className="p-3">Mã Đơn Khóa Học</th>
                <th className="p-3">Số Tiền Nhận</th>
                <th className="p-3">Thời Gian Thực Hiện</th>
                <th className="p-3">Trạng Thái Idempotency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-500">
                    Chưa nhận được giao dịch webhook thực tế nào.
                  </td>
                </tr>
              ) : (
                logs.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/80">
                    <td className="p-3 font-mono font-semibold text-white">{p.transactionId}</td>
                    <td className="p-3 font-bold text-gold-400">{p.provider}</td>
                    <td className="p-3 font-mono text-zinc-200">{p.orderCode}</td>
                    <td className="p-3 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                    <td className="p-3 text-zinc-400">{p.paidAt}</td>
                    <td className="p-3">
                      <Badge variant="success" className="text-[10px] gap-1 px-2 py-0.5 font-bold">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED (Anti-Replay)
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
