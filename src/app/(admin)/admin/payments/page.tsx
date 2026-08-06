"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, ShieldCheck } from "lucide-react";
import { MockBanner } from "@/components/admin/MockBanner";
import { formatCurrency } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const paymentLogs = [
    {
      id: "pay-1",
      provider: "SePay (Techcombank)",
      transactionId: "FT2621498124",
      orderCode: "KP98241",
      amount: 1490000,
      paidAt: "2026-08-02 20:45:12",
      idempotencyVerified: true,
    },
    {
      id: "pay-2",
      provider: "PayOS (MBBank)",
      transactionId: "FT2621498125",
      orderCode: "KP98240",
      amount: 990000,
      paidAt: "2026-08-01 16:20:00",
      idempotencyVerified: true,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch Sử Giao Dịch & Webhook Thanh Toán"
        description="Nhật ký nhận Webhook VietQR ngân hàng thực tế và xác minh anti-replay idempotency."
      />
      <MockBanner />

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
            <tr>
              <th className="p-3">Mã Giao Dịch Ngân Hàng</th>
              <th className="p-3">Cổng Thanh Toán</th>
              <th className="p-3">Mã Đơn Khóa Học</th>
              <th className="p-3">Số Tiền Nhận</th>
              <th className="p-3">Thời Gian Thực Hiện</th>
              <th className="p-3">Idempotency Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {paymentLogs.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-900/80">
                <td className="p-3 font-mono font-semibold text-white">{p.transactionId}</td>
                <td className="p-3 font-bold text-gold-400">{p.provider}</td>
                <td className="p-3 font-mono text-zinc-200">{p.orderCode}</td>
                <td className="p-3 font-bold text-emerald-400">{formatCurrency(p.amount)}</td>
                <td className="p-3 text-zinc-400">{p.paidAt}</td>
                <td className="p-3">
                  <Badge variant="success" className="text-[10px] gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED (No Replay)
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
