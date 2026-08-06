import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-gold-400">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <h2 className="text-xl font-semibold text-zinc-200">Trang bạn tìm kiếm không tồn tại</h2>
      <p className="text-sm text-zinc-400 max-w-md">
        Đường dẫn bạn vừa truy cập có thể đã bị thay đổi hoặc không có sẵn trong hệ thống KIENPRO LMS.
      </p>
      <div className="pt-2">
        <Button variant="gold" asChild>
          <Link href="/">Quay về Trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
