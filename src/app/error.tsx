"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold text-white">Đã xảy ra lỗi không mong muốn</h2>
      <p className="text-sm text-zinc-400 max-w-md">
        Hệ thống ghi nhận sự cố. Bạn có thể thử tải lại trang hoặc quay về trang chủ.
      </p>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => reset()}>
          Thử lại
        </Button>
        <Button variant="gold" asChild>
          <Link href="/">Quay về Trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
