"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Move,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  allowDownload?: boolean;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  allowDownload = true,
}: ImageLightboxModalProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset scale and position when opening
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") handleReset();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scale]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Dragging / Pan when scale > 1
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.15, 4));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.15, 0.5);
        if (next <= 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/60 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#2997ff]" />
          <h3 className="text-sm font-semibold text-white truncate max-w-md">
            {title || "Chi tiết hình ảnh"}
          </h3>
          <span className="text-xs text-zinc-400 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            {Math.round(scale * 100)}%
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 p-0 text-zinc-300 hover:text-white hover:bg-white/10"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2 text-xs text-zinc-300 hover:text-white hover:bg-white/10 font-mono"
            title="Đặt lại 100% (0)"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> 100%
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="h-8 w-8 p-0 text-zinc-300 hover:text-white hover:bg-white/10"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-4 bg-white/20 mx-1" />

          {/* Scale Slider */}
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#2997ff] hidden sm:block"
          />

          <div className="w-px h-4 bg-white/20 mx-1 hidden sm:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 text-zinc-300 hover:text-white hover:bg-white/10 hidden sm:inline-flex"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {allowDownload && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 w-8 p-0 text-zinc-300 hover:text-white hover:bg-white/10"
              title="Tải ảnh về máy"
            >
              <a href={imageUrl} download={title || "image"} target="_blank" rel="noopener noreferrer">
                <Download className="w-4 h-4 text-emerald-400" />
              </a>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-zinc-300 hover:text-white hover:bg-red-500/20 hover:text-red-400 ml-1"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        className={`flex-1 overflow-hidden flex items-center justify-center p-4 relative ${
          scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
        }`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onClick={(e) => {
          if (e.target === e.currentTarget && scale === 1) onClose();
        }}
      >
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.15s ease-out",
          }}
          className="max-w-full max-h-full flex items-center justify-center"
        >
          <img
            src={imageUrl}
            alt={title || "Image view"}
            draggable={false}
            className="max-h-[82vh] max-w-[92vw] object-contain rounded-lg shadow-2xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
          />
        </div>

        {/* Pan tip when zoomed */}
        {scale > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 border border-zinc-700/80 px-3 py-1.5 rounded-full text-[11px] text-zinc-300 flex items-center gap-2 shadow-lg backdrop-blur pointer-events-none">
            <Move className="w-3.5 h-3.5 text-[#2997ff]" />
            <span>Kéo chuột để di chuyển xem chi tiết các góc ảnh</span>
          </div>
        )}
      </div>

      {/* Bottom info */}
      <div className="py-2.5 px-6 border-t border-white/10 bg-black/60 text-center text-xs text-zinc-400">
        Mẹo: Dùng con lăn chuột hoặc nút (+ / -) để phóng to thu nhỏ • Nhấn phím Esc để đóng
      </div>
    </div>
  );
}
