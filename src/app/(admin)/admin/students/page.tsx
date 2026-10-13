"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Mail,
  Phone,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  UserPlus,
  ChevronDown,
  BookOpen,
  Trash2,
  XCircle,
  MoreHorizontal,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ProvisionStudentsDialog } from "@/components/admin/ProvisionStudentsDialog";
import {
  toggleStudentActivationAction,
  resendStudentActivationEmailAction,
  addCourseToStudentAction,
  deleteStudentAction,
} from "@/server/actions/student";

export default function AdminStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "activated" | "pending">("all");
  const [students, setStudents] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisionOpen, setIsProvisionOpen] = useState(false);

  // State cho Modal Thêm Khóa Học
  const [studentToAddCourse, setStudentToAddCourse] = useState<any | null>(null);
  const [courseToAddId, setCourseToAddId] = useState<string>("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  // State cho Modal Xác Nhận Xóa
  const [studentToDelete, setStudentToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Tải danh sách khóa học
  const fetchCourses = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("courses")
        .select("id, title")
        .order("created_at", { ascending: false });
      if (data) setCoursesList(data);
    } catch (err) {
      console.error("Lỗi tải danh sách khóa học:", err);
    }
  };

  // 2. Tải danh sách học viên
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

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

      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("user_id, course_id, courses(title)");

      const merged = (profilesData || []).map((profile) => {
        const email = profile.email || null;

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
    fetchCourses();

    const supabase = createClient();
    const channel = supabase
      .channel("admin-students-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchStudents()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => fetchStudents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Xử lý Bật/Tắt kích hoạt
  const handleToggleActivation = async (studentId: string, currentStatus: boolean) => {
    try {
      const res = await toggleStudentActivationAction(studentId, !currentStatus);
      if (res.success) {
        toast.success(res.message);
        fetchStudents();
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error("Đã xảy ra lỗi.");
    }
  };

  // 4. Xử lý Gửi lại email kích hoạt
  const handleResendEmail = async (studentId: string) => {
    try {
      toast.loading("Đang gửi email...", { id: "resend-email" });
      const res = await resendStudentActivationEmailAction(studentId);
      if (res.success) {
        toast.success(res.message, { id: "resend-email" });
      } else {
        toast.error(res.error, { id: "resend-email" });
      }
    } catch {
      toast.error("Lỗi gửi lại email.", { id: "resend-email" });
    }
  };

  // 5. Xử lý Thêm khóa học
  const handleConfirmAddCourse = async () => {
    if (!studentToAddCourse || !courseToAddId) {
      toast.error("Vui lòng chọn khóa học muốn thêm.");
      return;
    }
    setIsAddingCourse(true);
    try {
      const res = await addCourseToStudentAction(studentToAddCourse.id, courseToAddId);
      if (res.success) {
        toast.success(res.message);
        setStudentToAddCourse(null);
        setCourseToAddId("");
        fetchStudents();
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi thêm khóa học.");
    } finally {
      setIsAddingCourse(false);
    }
  };

  // 6. Xử lý Xóa học viên
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteStudentAction(studentToDelete.id);
      if (res.success) {
        toast.success(res.message);
        setStudentToDelete(null);
        fetchStudents();
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa học viên.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Lọc dữ liệu theo Search và Trạng thái
  const filtered = students.filter((s) => {
    const matchesSearch =
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.enrolledCourses.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "activated") return !!s.is_activated;
    if (statusFilter === "pending") return !s.is_activated;
    return true;
  });

  const activatedCount = students.filter((s) => s.is_activated).length;
  const pendingCount = students.filter((s) => !s.is_activated).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản Lý Học Viên"
        description="Xem danh sách tài khoản, các khóa học sở hữu và kích hoạt nhanh quyền truy cập."
      />

      {/* Toolbar & Filter */}
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT hoặc khóa học..."
              className="pl-9 bg-zinc-950 border-zinc-800 text-xs"
            />
          </div>

          {/* Bộ lọc trạng thái kích hoạt */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === "all"
                  ? "bg-zinc-800 text-gold-400 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Tất cả ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("activated")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === "activated"
                  ? "bg-zinc-800 text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Đã kích hoạt ({activatedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("pending")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                statusFilter === "pending"
                  ? "bg-zinc-800 text-amber-400 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Chờ kích hoạt ({pendingCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Đang lắng nghe realtime
          </span>

          <Button
            variant="outline"
            size="sm"
            className="text-[10px] h-8 px-3 border-zinc-700 hover:bg-zinc-800"
            onClick={fetchStudents}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
            {isLoading ? "Đang tải..." : "Làm mới"}
          </Button>

          <Button
            variant="gold"
            size="sm"
            className="text-xs h-8 px-3 font-bold shadow-md shadow-gold-500/10 flex items-center gap-1.5"
            onClick={() => setIsProvisionOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Cấp Tài Khoản Mới
          </Button>
        </div>
      </div>

      {/* Bảng danh sách học viên */}
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
                  <td colSpan={7} className="p-6 text-center text-zinc-500">
                    Không tìm thấy học viên nào phù hợp bộ lọc.
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

                    {/* Nút Thao Tác Đa Năng */}
                    <td className="p-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-[11px] border-zinc-700 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 font-medium"
                          >
                            <span>Thao tác</span>
                            <ChevronDown className="w-3 h-3 ml-1 text-zinc-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-zinc-800 text-zinc-200 text-xs shadow-2xl">
                          {/* 1. Gửi lại email */}
                          {s.email && (
                            <DropdownMenuItem
                              onClick={() => handleResendEmail(s.id)}
                              className="cursor-pointer hover:bg-zinc-900 text-zinc-200"
                            >
                              <Mail className="w-3.5 h-3.5 mr-2 text-gold-400" />
                              Gửi lại email
                            </DropdownMenuItem>
                          )}

                          {/* 2. Kích hoạt / Khóa */}
                          <DropdownMenuItem
                            onClick={() => handleToggleActivation(s.id, !!s.is_activated)}
                            className="cursor-pointer hover:bg-zinc-900 text-zinc-200"
                          >
                            {s.is_activated ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 mr-2 text-amber-400" />
                                Hủy kích hoạt
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                Kích hoạt tài khoản
                              </>
                            )}
                          </DropdownMenuItem>

                          {/* 3. Thêm khóa học */}
                          <DropdownMenuItem
                            onClick={() => {
                              setStudentToAddCourse(s);
                              if (coursesList.length > 0) setCourseToAddId(coursesList[0].id);
                            }}
                            className="cursor-pointer hover:bg-zinc-900 text-zinc-200"
                          >
                            <BookOpen className="w-3.5 h-3.5 mr-2 text-blue-400" />
                            Thêm khóa học
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="bg-zinc-800" />

                          {/* 4. Xóa học viên */}
                          {s.user_roles?.[0]?.role !== "super_admin" && (
                            <DropdownMenuItem
                              onClick={() => setStudentToDelete(s)}
                              className="cursor-pointer hover:bg-red-500/10 text-red-400 focus:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2 text-red-400" />
                              Xóa học viên
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Cấp Tài Khoản Mới Hàng Loạt */}
      <ProvisionStudentsDialog
        open={isProvisionOpen}
        onOpenChange={setIsProvisionOpen}
        onSuccess={fetchStudents}
      />

      {/* Modal Thêm Khóa Học Cho Học Viên */}
      <Dialog open={!!studentToAddCourse} onOpenChange={(open) => !open && setStudentToAddCourse(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Thêm Khóa Học Cho Học Viên</DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Cấp quyền truy cập khóa học cho học viên: <strong className="text-white">{studentToAddCourse?.full_name}</strong> ({studentToAddCourse?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <label className="text-xs font-semibold text-zinc-300">Chọn khóa học muốn thêm:</label>
            <Select value={courseToAddId} onValueChange={setCourseToAddId}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs">
                <SelectValue placeholder="Chọn khóa học..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {coursesList.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudentToAddCourse(null)}
              disabled={isAddingCourse}
              className="text-xs border-zinc-800 text-zinc-400"
            >
              Hủy
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleConfirmAddCourse}
              disabled={isAddingCourse}
              className="text-xs font-bold"
            >
              {isAddingCourse ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5 mr-1.5" />}
              Xác Nhận Thêm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Xác Nhận Xóa Học Viên */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-400 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Xác Nhận Xóa Học Viên
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-300">
              Bạn có chắc chắn muốn xóa học viên <strong className="text-white">{studentToDelete?.full_name}</strong> ({studentToDelete?.email || "Chưa có email"})?
              <br />
              <span className="text-red-400 block mt-2">Hành động này sẽ xóa hoàn toàn thông tin tài khoản và quyền học của học viên!</span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStudentToDelete(null)}
              disabled={isDeleting}
              className="text-xs border-zinc-800 text-zinc-400"
            >
              Hủy Bỏ
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="text-xs font-bold"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
