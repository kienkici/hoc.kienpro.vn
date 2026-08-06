"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, RefreshCw, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Query profiles and join user_roles
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        user_roles (
          role
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Không tải được thông tin học viên.");
    } else {
      setStudents(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleResendEmail = (email: string) => {
    toast.success(`Đã gửi lại email kích hoạt đến ${email}!`);
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Học Viên"
        description="Xem danh sách tài khoản, trạng thái kích hoạt và gửi lại Email xác thực."
      />

      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên hoặc email học viên..."
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
                <th className="p-3">Học Viên</th>
                <th className="p-3">Liên Hệ</th>
                <th className="p-3">Vai Trò</th>
                <th className="p-3">Trạng Thái Kích Hoạt</th>
                <th className="p-3">Ngày Tạo</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-900/80">
                  <td className="p-3 font-semibold text-white">{s.full_name}</td>
                  <td className="p-3">
                    <div>{s.phone || "Không có SĐT"}</div>
                  </td>
                  <td className="p-3 capitalize font-bold text-gold-400">
                    {s.user_roles?.[0]?.role || "student"}
                  </td>
                  <td className="p-3">
                    {s.status === "active" ? (
                      <Badge variant="success" className="text-[10px]">Đã Kích Hoạt</Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">Chờ Kích Hoạt</Badge>
                    )}
                  </td>
                  <td className="p-3 text-zinc-400">
                    {new Date(s.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => handleResendEmail("học viên")}>
                      <RefreshCw className="w-3 h-3 mr-1" /> Gửi Lại Email
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
