"use client";

import { useState } from "react";
import { Upload, Video, Play, CheckCircle2, AlertCircle, RefreshCw, X, Link as LinkIcon, Film } from "lucide-react";
import { Lesson, VideoAsset, VideoProvider, VideoStatus } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface VideoManagerTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function VideoManagerTab({ lesson, onSaveMock }: VideoManagerTabProps) {
  const [provider, setProvider] = useState<VideoProvider>(lesson.video?.provider || "bunny");
  const [externalId, setExternalId] = useState(lesson.video?.externalId || "");
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(lesson.video?.status || "ready");
  const [uploadProgress, setUploadProgress] = useState(lesson.video?.uploadProgress || 100);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  // Mock Upload Simulation
  const handleSimulateUpload = () => {
    setVideoStatus("uploading");
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setVideoStatus("processing");
          setTimeout(() => {
            setVideoStatus("ready");
            setExternalId("demo-bunny-video-999");
          }, 1500);
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  const handleCancelUpload = () => {
    setVideoStatus("failed");
    setUploadProgress(0);
  };

  const handleSave = () => {
    setSaveState("saving");
    const videoAsset: VideoAsset = {
      id: lesson.video?.id || "vid-mock-99",
      provider,
      externalId,
      title: lesson.title,
      durationSeconds: 750,
      status: videoStatus,
      thumbnailUrl: lesson.thumbnailUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80",
      uploadProgress: 100,
      fileSize: 125000000,
      resolution: "1920x1080",
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSaveMock({ video: videoAsset });
      setSaveState("saved");
    }, 600);
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Film className="w-5 h-5 text-gold-400" /> 2. Quản Lý Video Bài Giảng (Video Engine)
        </h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="space-y-6">
        {/* Select Provider */}
        <div className="space-y-1 max-w-md">
          <label className="text-xs font-semibold text-zinc-300">Nhà Cung Cấp Video (Video Provider)</label>
          <Select value={provider} onValueChange={(val) => setProvider(val as VideoProvider)}>
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-xs">
              <SelectValue placeholder="Chọn dịch vụ Stream" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
              <SelectItem value="bunny">Bunny Stream (HLS Encrypted - Khuyên dùng)</SelectItem>
              <SelectItem value="cloudflare">Cloudflare Stream</SelectItem>
              <SelectItem value="upload">Upload Trực Tiếp Mock UI</SelectItem>
              <SelectItem value="external">Embed URL Bên Ngoài (YouTube / Vimeo)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Upload Area / External Input */}
        {provider === "upload" || provider === "bunny" ? (
          <div className="space-y-4">
            {provider === "bunny" && (
              <div className="space-y-2 p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-left">
                <label className="text-xs font-semibold text-zinc-300">
                  Mã Video ID (Dán ID video từ Bunny.net của bạn):
                </label>
                <Input
                  value={externalId}
                  onChange={(e) => {
                    setExternalId(e.target.value);
                    setVideoStatus("ready");
                  }}
                  placeholder="Ví dụ: 7b23f8c8-a92c-473d-8fa0-fb6958b..."
                  className="bg-zinc-900 border-zinc-800"
                />
                <p className="text-[10px] text-zinc-500">
                  Sau khi upload video lên Bunny.net, copy mã ID của video đó dán vào đây để phát chống tải lậu.
                </p>
              </div>
            )}

            <div className="border-2 border-dashed border-zinc-800 hover:border-gold-500/50 rounded-xl p-8 text-center bg-zinc-950/50 space-y-4 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Kéo thả file Video vào đây hoặc bấm Tải file</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Định dạng cho phép: MP4, MOV, MKV (Tối đa 2GB). Mã hóa HLS Bunny Stream tự động.
                </p>
              </div>

              {videoStatus === "ready" ? (
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Video Sẵn Sàng (Ready)
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleSimulateUpload} className="text-xs">
                    Tải File Khác
                  </Button>
                </div>
              ) : (
                <Button variant="gold" size="sm" onClick={handleSimulateUpload} className="font-bold">
                  Bắt Đầu Upload Demo
                </Button>
              )}
            </div>

            {/* Upload Progress Bar */}
            {videoStatus === "uploading" && (
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs text-zinc-300 font-semibold">
                  <span>Đang tải video lên server mã hóa...</span>
                  <span className="text-gold-400">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
                <div className="flex justify-end pt-1">
                  <Button variant="destructive" size="sm" onClick={handleCancelUpload} className="text-xs">
                    <X className="w-3 h-3 mr-1" /> Hủy Upload
                  </Button>
                </div>
              </div>
            )}

            {/* Processing State */}
            {videoStatus === "processing" && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Đang xử lý Transcoding 1080p HLS trên Bunny Stream CDN...</span>
                </div>
              </div>
            )}

            {/* Failed State */}
            {videoStatus === "failed" && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>Tải video thất bại hoặc bị hủy.</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleSimulateUpload} className="text-xs">
                  Thử Lại
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              Mã Video ID (Bunny / CF Stream ID hoặc Embed URL)
            </label>
            <Input
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder="Nhập ID Video hoặc link Embed..."
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSave} variant="gold" className="font-bold">
          Lưu Cấu Hình Video
        </Button>
      </div>
    </div>
  );
}
