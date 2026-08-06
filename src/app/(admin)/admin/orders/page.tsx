"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, CheckCircle2, XCircle, Clock } from "lucide-react";
import { MockBanner } from "@/components/admin/MockBanner";
import { MOCK_ORDERS } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = MOCK_ORDERS.filter(
    (o) =>
      o.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Đơn Hàng Mua Khóa Học"
        description="Tra cứu đơn hàng, trạng thái thanh toán VietQR và đối soát."
      />
      <MockBanner />

      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã đơn (KPxxxx), email..."
            className="pl-9 bg-zinc-950 border-zinc-800 text-xs"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
            <tr>
              <th className="p-3">Mã Đơn Hàng</th>
              <th className="p-3">Khách Hàng</th>
              <th className="p-3">Số Tiền</th>
              <th className="p-3">Trạng Thái</th>
              <th className="p-3">Thời Gian Tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-900/80">
                <td className="p-3 font-mono font-bold text-gold-400">{order.orderCode}</td>
                <td className="p-3">
                  <div className="font-semibold text-white">{order.customerName}</div>
                  <div className="text-[10px] text-zinc-400">{order.customerEmail} • {order.customerPhone}</div>
                </td>
                <td className="p-3 font-bold text-white">{formatCurrency(order.totalAmount)}</td>
                <td className="p-3">
                  {order.status === "PAID" ? (
                    <Badge variant="success" className="text-[10px]">PAID - Đã Thanh Toán</Badge>
                  ) : order.status === "PENDING" ? (
                    <Badge variant="warning" className="text-[10px]">PENDING - Chờ QR</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px]">CANCELLED</Badge>
                  )}
                </td>
                <td className="p-3 text-zinc-400">{order.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
