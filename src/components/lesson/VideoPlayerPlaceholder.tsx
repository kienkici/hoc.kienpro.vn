"use client";

import { Play, Volume2, Maximize, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VideoPlayerPlaceholderProps {
  title: string;
  videoUrlPlaceholder?: string;
  isCompleted?: boolean;
  onMarkCompleted?: () => void;
}

export function VideoPlayerPlaceholder({
  title,
  videoUrlPlaceholder,
  isCompleted = false,
  onMarkCompleted,
}: VideoPlayerPlaceholderProps) {
  return (
    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl group">
      {videoUrlPlaceholder ? (
        <video
          src={videoUrlPlaceholder}
          controls
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
            <Play className="w-8 h-8 fill-gold-400 ml-1" />
          </div>
          <div>
            <Badge variant="gold" className="mb-2">DEMO VIDEO PLAYER</Badge>
            <h3 className="text-lg font-bold text-white max-w-md">{title}</h3>
            <p className="text-xs text-zinc-400 mt-1">
              [Mock Player] HLS Video streaming Encrypted via Bunny Stream CDN
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
