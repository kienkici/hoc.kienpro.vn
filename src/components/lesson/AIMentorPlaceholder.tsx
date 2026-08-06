"use client";

import { Sparkles, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AIMentorPlaceholder() {
  return (
    <div className="rounded-xl border border-gold-500/30 bg-zinc-900/80 p-5 space-y-4 shadow-lg shadow-gold-500/5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center text-gold-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Mentor Trợ Lý Thông Minh <Sparkles className="w-4 h-4 text-gold-400" />
            </h4>
            <p className="text-[11px] text-zinc-400">Huấn luyện dựa trên tài liệu khóa học Kiên Pro</p>
          </div>
        </div>
        <Badge variant="gold" className="text-[10px]">PLACEHOLDER (V3 SCOPE)</Badge>
      </div>

      {/* Mock Chat Conversation */}
      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center shrink-0 text-xs font-bold">
            AI
          </div>
          <div className="rounded-2xl rounded-tl-none bg-zinc-800 p-3 text-xs text-zinc-200 leading-relaxed">
            Xin chào! Tôi là AI Mentor của thương hiệu Kiên Pro. Bạn có thắc mắc gì về bài học <strong>&ldquo;Tư duy giao diện Premium Gold/Dark&rdquo;</strong> này không?
          </div>
        </div>

        <div className="flex items-start gap-2.5 justify-end">
          <div className="rounded-2xl rounded-tr-none bg-gold-500/20 border border-gold-500/30 p-3 text-xs text-gold-200 leading-relaxed">
            Cho mình hỏi làm sao để giữ được độ đọc tốt khi dùng nền đen hoàn toàn?
          </div>
        </div>
      </div>

      {/* Mock Input Form */}
      <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
        <Input
          placeholder="Đặt câu hỏi cho AI Mentor..."
          className="text-xs bg-zinc-950 border-zinc-800"
          disabled
        />
        <Button variant="gold" size="sm" disabled className="shrink-0">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </div>
      <p className="text-[10px] text-zinc-500 text-center italic">
        * Chức năng AI Mentor đang hiển thị giao diện mẫu UI. Sẽ tích hợp API trong Version 3.0.
      </p>
    </div>
  );
}
