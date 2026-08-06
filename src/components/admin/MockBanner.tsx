import { Info } from "lucide-react";

interface MockBannerProps {
  message?: string;
}

export function MockBanner({ message }: MockBannerProps) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-lg text-xs flex items-center justify-between gap-2 shadow-sm my-3">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          {message || "[DEMO MOCK UI] Mọi thao tác lưu, xóa, upload video/tài liệu trong Admin đang dùng Mock State trên Client. Chưa ghi dữ liệu thật vào DB/Bunny Stream."}
        </span>
      </div>
    </div>
  );
}
