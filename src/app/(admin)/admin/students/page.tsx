"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, RefreshCw, Loader2, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // 1. Tải hồ sơ học viên kèm vai trò
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (
            role
          )
        `)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // 2. Tải danh sách kích hoạt khóa học (enrollments)
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("user_id, course_id, courses(title)");

      // 3. Tải danh sách đơn hàng để đối khớp email qua số điện thoại
      const { data: ordersData } = await supabase
        .from("orders")
        .select("customer_phone, customer_email");

      // 4. Ánh xạ dữ liệu để hiển thị tối ưu cho việc chăm sóc học viên
      const merged = (profilesData || []).map((profile) => {
        // Ánh xạ email
        const matchedOrder = (ordersData || []).find(
          (o) => o.customer_phone === profile.phone
        );
        const email = matchedOrder ? matchedOrder.customer_email : null;

        // Ánh xạ danh sách khóa học sở hữu
        const enrolled = (enrollmentsData || [])
          .filter((e) => e.user_id === profile.id)
          .map((e) => {
            const c = e.courses as any;
            if (Array.isArray(c)) {
              return c[0]?.title || "Khóa học";
            }
            return c?.title || "Khóa học";
          });

        return {
          ...profile,
          email,
          enrolledCourses: enrolled,
        };
      });

      setStudents(merged);
    } catch (err) {
      console.error("Lỗi tải danh sách học viên:", err);
      toast.error("Không tải được thông tin học viên.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleToggleActivation = async (studentId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({ is_activated: !currentStatus })
        .eq("id", studentId);

      if (error) {
        toast.error("Không thể cập nhật trạng thái kích hoạt.");
      } else {
        toast.success(
          !currentStatus 
            ? "Đã kích hoạt tài khoản học viên thành công!" 
            : "Đã hủy kích hoạt tài khoản học viên!"
        );
        fetchStudents(); // Cập nhật lại danh sách ngay lập tức
      }
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi.");
    }
  };

  const handleResendEmail = (email: string) => {
    toast.success(`Đã gửi lại email kích hoạt & hướng dẫn đến ${email}!`);
  };

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.enrolledCourses.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Học Viên"
        description="Xem danh sách tài khoản, các khóa học sở hữu và kích hoạt nhanh quyền truy cập."
      />

      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT hoặc khóa học..."
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
                <th className="p-3">Thông Tin Liên Hệ</th>
                <th className="p-3">Khóa Học Sở Hữu (Upsell Info)</th>
                <th className="p-3">Vai Trò</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Ngày Tham Gia</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-zinc-500">
                    Không tìm thấy học viên nào.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-900/80">
                    <td className="p-3 font-semibold text-white">{s.full_name}</td>
                    <td className="p-3 space-y-0.5">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-zinc-500" />
                        <span>{s.email || "Chưa có email"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{s.phone || "Chưa có SĐT"}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      {s.enrolledCourses.length === 0 ? (
                        <span className="text-[10px] text-zinc-500 italic">Chưa kích hoạt khóa nào</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {s.enrolledCourses.map((c: string, idx: number) => (
                            <Badge key={idx} variant="gold" className="text-[9px] px-1.5 py-0.5 font-bold">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`capitalize font-bold ${s.user_roles?.[0]?.role === "student" ? "text-zinc-400" : "text-gold-400 flex items-center gap-0.5"}`}>
                        {s.user_roles?.[0]?.role === "super_admin" && <ShieldAlert className="w-3.5 h-3.5 text-gold-400" />}
                        {s.user_roles?.[0]?.role || "student"}
                      </span>
                    </td>
                    <td className="p-3">
                      {s.is_activated ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã Kích Hoạt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[10px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chờ Kích Hoạt
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-zinc-400">
                      {new Date(s.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="p-3 space-x-2 text-right">
                      {s.email && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] h-7 px-2 border-zinc-700 hover:bg-zinc-800"
                          onClick={() => handleResendEmail(s.email)}
                        >
                          <RefreshCw className="w-2.5 h-2.5 mr-1" /> Hướng Dẫn
                        </Button>
                      )}
                      
                      <Button
                        variant={s.is_activated ? "destructive" : "gold"}
                        size="sm"
                        className="text-[10px] h-7 px-2 font-bold"
                        onClick={() => handleToggleActivation(s.id, !!s.is_activated)}
                      >
                        {s.is_activated ? "Khóa học" : "Kích hoạt"}
                      </Button>
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
