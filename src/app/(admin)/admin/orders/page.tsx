"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          courses (
            title
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Lỗi tải đơn hàng:", error);
        toast.error("Không tải được thông tin đơn hàng.");
      } else {
        setOrders(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter(
    (o) =>
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.courses?.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Đơn Hàng Mua Khóa Học"
        description="Tra cứu đơn hàng, trạng thái thanh toán VietQR và đối soát."
      />

      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã đơn (KPxxxx), email, SĐT..."
            className="pl-9 bg-zinc-950 border-zinc-800 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3">Mã Đơn Hàng</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Khóa Học</th>
                <th className="p-3">Số Tiền</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Thời Gian Tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-zinc-500">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-900/80">
                    <td className="p-3 font-mono font-bold text-gold-400">{order.code}</td>
                    <td className="p-3">
                      <div className="font-semibold text-white">{order.customer_name}</div>
                      <div className="text-[10px] text-zinc-400">{order.customer_email} • {order.customer_phone}</div>
                    </td>
                    <td className="p-3 font-medium text-zinc-200">{order.courses?.title || "Khóa học không xác định"}</td>
                    <td className="p-3 font-bold text-white">{formatCurrency(Number(order.amount))}</td>
                    <td className="p-3">
                      {order.status === "paid" ? (
                        <Badge variant="success" className="text-[10px]">PAID - Đã Thanh Toán</Badge>
                      ) : order.status === "pending" ? (
                        <Badge variant="warning" className="text-[10px]">PENDING - Chờ QR</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">FAILED / CANCELLED</Badge>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {new Date(order.created_at).toLocaleString("vi-VN")}
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
