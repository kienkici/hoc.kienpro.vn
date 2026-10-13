"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UserPlus,
  Mail,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import { provisionStudentsBatchAction } from "@/server/actions/student";
import { ProvisionResultItem, ProvisionStudentItem } from "@/types/student";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ProvisionStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProvisionStudentsDialog({
  open,
  onOpenChange,
  onSuccess,
}: ProvisionStudentsDialogProps) {
  const [courses, setCourses] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [rawInput, setRawInput] = useState<string>("");
  const [sendEmail, setSendEmail] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [results, setResults] = useState<ProvisionResultItem[] | null>(null);

  // 1. Tải danh sách khóa học và chọn mặc định khóa Facebook Ads
  useEffect(() => {
    if (!open) return;

    const loadCourses = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("courses")
          .select("id, title, slug")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setCourses(data);

          // Tìm khóa Facebook Ads ưu tiên chọn trước
          const fbCourse = data.find(
            (c) =>
              c.title.toLowerCase().includes("facebook") ||
              c.slug.toLowerCase().includes("facebook")
          );

          if (fbCourse) {
            setSelectedCourseId(fbCourse.id);
          } else {
            setSelectedCourseId(data[0].id);
          }
        }
      } catch (err) {
        console.error("Lỗi tải khóa học:", err);
      }
    };

    loadCourses();
  }, [open]);

  // 2. Parse danh sách email theo thời gian thực
  const parsedStudents = useMemo<ProvisionStudentItem[]>(() => {
    if (!rawInput.trim()) return [];

    const lines = rawInput.split(/[\n;]+/);
    const list: ProvisionStudentItem[] = [];
    const seenEmails = new Set<string>();

    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      const emailMatch = line.match(emailRegex);
      if (emailMatch) {
        const email = emailMatch[1].toLowerCase().trim();
        if (seenEmails.has(email)) continue;
        seenEmails.add(email);

        // Trích xuất Tên / SĐT nếu có
        let remaining = line.replace(emailMatch[0], "").replace(/[,<>()"']/g, " ").trim();
        let phone: string | undefined = undefined;
        let fullName: string | undefined = undefined;

        // Tìm số điện thoại (10 chữ số)
        const phoneMatch = remaining.match(/(\b(0\d{9})\b)/);
        if (phoneMatch) {
          phone = phoneMatch[1];
          remaining = remaining.replace(phoneMatch[0], "").trim();
        }

        if (remaining.length > 1) {
          fullName = remaining.replace(/\s+/g, " ").trim();
        }

        list.push({
          email,
          fullName: fullName || undefined,
          phone,
        });
      }
    }

    return list;
  }, [rawInput]);

  // Reset form khi đóng mở
  const handleClose = () => {
    if (isSubmitting) return;
    setResults(null);
    setRawInput("");
    onOpenChange(false);
  };

  // 3. Tiến hành cấp tài khoản
  const handleSubmit = async () => {
    if (!selectedCourseId) {
      toast.error("Vui lòng chọn khóa học để cấp quyền!");
      return;
    }

    if (parsedStudents.length === 0) {
      toast.error("Vui lòng nhập ít nhất 1 địa chỉ Gmail học viên hợp lệ!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await provisionStudentsBatchAction({
        courseId: selectedCourseId,
        students: parsedStudents,
        sendEmail,
      });

      if (res.success) {
        setResults(res.results);
        toast.success(
          `Đã xử lý xong: ${res.successCount}/${res.total} học viên thành công!`
        );
        onSuccess?.();
      } else {
        toast.error(res.error || "Không thể cấp tài khoản học viên.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi hệ thống khi cấp tài khoản.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy toàn bộ link kích hoạt
  const handleCopyAllLinks = () => {
    if (!results) return;
    const textToCopy = results
      .filter((r) => r.activationLink)
      .map((r) => `${r.fullName || r.email}: ${r.activationLink}`)
      .join("\n");

    if (!textToCopy) {
      toast.info("Không có link kích hoạt mới nào (các tài khoản đã kích hoạt từ trước).");
      return;
    }

    navigator.clipboard.writeText(textToCopy);
    toast.success("Đã copy toàn bộ link kích hoạt vào bộ nhớ đệm!");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Cấp Tài Khoản & Gửi Mail Kích Hoạt Học Viên
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-zinc-400">
            Hệ thống sẽ tự động tạo tài khoản, kích hoạt sẵn quyền học và gửi email kèm đường dẫn thiết lập mật khẩu đến học viên.
          </DialogDescription>
        </DialogHeader>

        {/* Nội dung Dialog */}
        <div className="space-y-5 py-4 overflow-y-auto flex-1 pr-1">
          {results ? (
            /* Màn hình kết quả sau khi chạy */
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Kết Quả Cấp Quyền & Gửi Email
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Tổng số: <strong className="text-white">{results.length}</strong> | 
                    Thành công: <strong className="text-emerald-400">{results.filter(r => r.status !== 'error').length}</strong> | 
                    Lỗi: <strong className="text-red-400">{results.filter(r => r.status === 'error').length}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyAllLinks}
                  className="text-xs border-zinc-700 hover:bg-zinc-800 text-gold-400 font-semibold"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Sao Chép Tất Cả Link Kích Hoạt
                </Button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {results.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-white">{item.email}</strong>
                        {item.fullName && (
                          <span className="text-zinc-400">({item.fullName})</span>
                        )}
                        {item.status === "success" && (
                          <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]">
                            {item.isNewAccount ? "Tài khoản mới" : "Đã có tài khoản"}
                          </Badge>
                        )}
                        {item.status === "already_enrolled" && (
                          <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10 text-[10px]">
                            Đã sở hữu khóa
                          </Badge>
                        )}
                        {item.status === "error" && (
                          <Badge variant="destructive" className="text-[10px]">
                            Lỗi
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400">{item.message}</p>
                    </div>

                    {item.activationLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-zinc-300 hover:text-gold-400 text-[11px]"
                        onClick={() => {
                          navigator.clipboard.writeText(item.activationLink!);
                          toast.success(`Đã copy link của ${item.email}`);
                        }}
                      >
                        <Copy className="w-3 h-3 mr-1" /> Copy Link
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Form nhập liệu */
            <>
              {/* Chọn khóa học */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  Khóa học kích hoạt sẵn cho học viên
                </label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-800 text-xs">
                    <SelectValue placeholder="Chọn khóa học..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id} className="text-xs">
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Ô dán danh sách Gmail */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-400" />
                    Dán danh sách Gmail học viên
                  </label>
                  <span className="text-[11px] text-zinc-400">
                    Đã nhận diện:{" "}
                    <strong className="text-gold-400 font-bold">
                      {parsedStudents.length}
                    </strong>{" "}
                    học viên
                  </span>
                </div>

                <Textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder={`Dán danh sách Gmail tại đây, mỗi người 1 dòng. Ví dụ:
nguyenhocvien1@gmail.com
tranvanb@gmail.com, 0981234567, Trần Văn B
lethic@gmail.com, Lê Thị C`}
                  rows={7}
                  className="bg-zinc-900 border-zinc-800 text-xs font-mono leading-relaxed placeholder:text-zinc-600 focus:border-gold-500"
                  disabled={isSubmitting}
                />

                <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1 text-zinc-300 font-medium">
                    <Info className="w-3 h-3 text-gold-400" />
                    Định dạng hỗ trợ:
                  </div>
                  <p>
                    • Chỉ cần email: <code className="text-gold-400">hocvien@gmail.com</code>
                  </p>
                  <p>
                    • Hoặc kèm tên, SĐT: <code className="text-gold-400">Nguyễn Văn A, a@gmail.com, 0988123456</code>
                  </p>
                </div>
              </div>

              {/* Tùy chọn gửi email */}
              <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white">
                    Tự động gửi email kích hoạt qua Resend ngay
                  </span>
                  <p className="text-[11px] text-zinc-400">
                    Gửi email định dạng Gold Premium thông báo và nút kích hoạt kèm link đặt mật khẩu (hạn 30 ngày).
                  </p>
                </div>
                <Switch
                  checked={sendEmail}
                  onCheckedChange={setSendEmail}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer actions */}
        <DialogFooter className="pt-3 border-t border-zinc-800 flex items-center justify-between sm:justify-between">
          {results ? (
            <Button
              variant="gold"
              size="sm"
              className="w-full font-bold"
              onClick={handleClose}
            >
              Hoàn Tất & Đóng
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-xs border-zinc-800 text-zinc-400 hover:text-white"
              >
                Hủy Bỏ
              </Button>

              <Button
                variant="gold"
                size="sm"
                disabled={isSubmitting || parsedStudents.length === 0}
                onClick={handleSubmit}
                className="text-xs font-bold shadow-lg shadow-gold-500/10 min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Đang Cấp Quyền ({parsedStudents.length})...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                    Cấp Quyền & Gửi Mail ({parsedStudents.length})
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
