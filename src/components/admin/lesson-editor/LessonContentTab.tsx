"use client";

import { useState, useRef, useEffect } from "react";
import { Lesson } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Save,
  Image as ImageIcon,
  Loader2,
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  Code,
  Eye,
  PenLine,
  ZoomIn,
  Trash2,
  ClipboardPaste,
  Columns,
  LayoutTemplate,
  Plus,
  Sparkles,
} from "lucide-react";
import { SaveIndicator, SaveState } from "../SaveIndicator";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";
import { toast } from "sonner";

interface LessonContentTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

interface ImageBlock {
  alt: string;
  url: string;
  raw: string;
}

export function LessonContentTab({ lesson, onSaveMock }: LessonContentTabProps) {
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [title, setTitle] = useState(lesson.title);
  const [slug, setSlug] = useState(lesson.slug);
  const [description, setDescription] = useState(lesson.description || "");
  const [contentMarkdown, setContentMarkdown] = useState(lesson.contentMarkdown || "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState<"landing" | "split" | "markdown">("landing");

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ url: "", title: "" });

  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state when lesson prop updates
  useEffect(() => {
    setTitle(lesson.title);
    setSlug(lesson.slug);
    setDescription(lesson.description || "");
    setContentMarkdown(lesson.contentMarkdown || "");
  }, [lesson]);

  // Extract all markdown images from text
  const getImagesList = (): ImageBlock[] => {
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    const images: ImageBlock[] = [];
    let match;
    while ((match = regex.exec(contentMarkdown)) !== null) {
      images.push({ alt: match[1], url: match[2], raw: match[0] });
    }
    return images;
  };

  const imagesList = getImagesList();

  // Helper to open lightbox
  const openLightbox = (url: string, imgTitle: string) => {
    setLightboxImage({ url, title: imgTitle });
    setLightboxOpen(true);
  };

  // Upload image to /api/upload and insert into markdown
  const uploadAndInsertImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chỉ chọn file hình ảnh (PNG, JPG, WEBP, GIF...).");
      return;
    }

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Tải ảnh thất bại");
      }

      const altText = file.name.substring(0, file.name.lastIndexOf(".")) || "Hình ảnh bài giảng";
      const imageMarkdown = `\n\n![${altText}](${data.url})\n\n`;

      setContentMarkdown((prev) => {
        if (!prev.trim()) return `![${altText}](${data.url})`;
        return prev + imageMarkdown;
      });
      setSaveState("unsaved");
      toast.success(`Đã thêm ảnh "${altText}" trực tiếp vào nội dung!`);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải ảnh lên máy chủ.");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  // Handle file input change
  const handleImageFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAndInsertImage(file);
  };

  // Handle Clipboard Paste (Cmd+V / Ctrl+V with copied screenshot/image)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          toast.info("Đang xử lý dán ảnh từ Clipboard máy tính...");
          await uploadAndInsertImage(file);
          return;
        }
      }
    }
  };

  // Handle Drag & Drop of image files
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith("image/")) {
          await uploadAndInsertImage(files[i]);
          break;
        }
      }
    }
  };

  // Remove an image block from markdown
  const handleDeleteImage = (rawMarkdown: string) => {
    const updated = contentMarkdown.replace(rawMarkdown, "").trim();
    setContentMarkdown(updated);
    setSaveState("unsaved");
    toast.info("Đã gỡ ảnh khỏi bài học.");
  };

  // Insert markdown syntax helper
  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContentMarkdown((prev) => prev + prefix + suffix);
      setSaveState("unsaved");
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = contentMarkdown.substring(start, end);
    const replacement = prefix + selected + suffix;

    const newContent =
      contentMarkdown.substring(0, start) + replacement + contentMarkdown.substring(end);
    setContentMarkdown(newContent);
    setSaveState("unsaved");

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveState("saving");
    onSaveMock({
      title,
      slug,
      description,
      contentMarkdown,
    });
    setSaveState("saved");
    toast.success("Lưu nội dung bài học thành công!");
  };

  return (
    <div
      onPaste={handlePaste}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="space-y-6 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            1. Nội Dung Bài Học (Mô Tả & Hình Ảnh Trực Quan)
            <span className="text-[10px] bg-[#0071e3]/20 text-[#2997ff] border border-[#0071e3]/30 px-2 py-0.5 rounded-full font-normal">
              Dạng Landing Page
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mô tả chi tiết và hình ảnh hiển thị trực tiếp. Hỗ trợ <b>sao chép ảnh dán vào (Cmd+V)</b> và <b>bấm vào ảnh để kéo phóng to/thu nhỏ</b>.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageFileInput}
        accept="image/*"
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Tên Bài Học *</label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setSaveState("unsaved");
              }}
              className="bg-zinc-950 border-zinc-800 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Slug URL *</label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSaveState("unsaved");
              }}
              className="bg-zinc-950 border-zinc-800 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300">Mô tả ngắn bài học</label>
          <Input
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setSaveState("unsaved");
            }}
            placeholder="Tóm tắt ý chính của bài giảng..."
            className="bg-zinc-950 border-zinc-800 text-sm"
          />
        </div>

        {/* Content Mode Switcher & Upload Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode("landing")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all ${
                  viewMode === "landing"
                    ? "bg-[#0071e3] text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> Giao diện Trực Quan (Ảnh & Mô tả)
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all ${
                  viewMode === "split"
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Columns className="w-3.5 h-3.5" /> Soạn thảo & Xem song song
              </button>
              <button
                type="button"
                onClick={() => setViewMode("markdown")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all ${
                  viewMode === "markdown"
                    ? "bg-zinc-800 text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <PenLine className="w-3.5 h-3.5" /> Mã nguồn Markdown
              </button>
            </div>

            {/* Quick Upload Buttons */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploadingImage}
                size="sm"
                className="h-8 text-xs gap-1.5 bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium shadow-sm"
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang tải ảnh...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" /> Tải Ảnh Lên
                  </>
                )}
              </Button>

              <div className="hidden lg:flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                <ClipboardPaste className="w-3 h-3 text-[#2997ff]" />
                <span>Sao chép ảnh rồi nhấn <b>Cmd+V</b> để dán</span>
              </div>
            </div>
          </div>

          {/* Quick Toolbar for formatting */}
          {viewMode !== "landing" && (
            <div className="flex flex-wrap items-center gap-1 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                onClick={() => insertTextAtCursor("**", "**")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="In đậm (**text**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("*", "*")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="In nghiêng (*text*)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("### ")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Tiêu đề (### Title)"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("[Tiêu đề](", ")")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Chèn liên kết"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertTextAtCursor("```\n", "\n```")}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                title="Khối code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* MODE 1: LANDING PAGE VISUAL VIEW (Default & Best UX) */}
          {viewMode === "landing" && (
            <div className="space-y-4">
              {/* Drop / Paste zone banner */}
              <div
                onClick={() => imageInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-800 hover:border-[#0071e3] transition-all rounded-xl p-4 text-center cursor-pointer bg-zinc-950/60 hover:bg-zinc-900/40 group"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-400">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 group-hover:bg-[#0071e3]/20 flex items-center justify-center text-[#2997ff] transition-colors">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span>
                    Kéo thả ảnh vào đây, hoặc <span className="text-[#2997ff] font-semibold underline underline-offset-2">bấm để chọn từ máy tính</span>, hoặc chỉ cần copy ảnh và nhấn <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-mono text-[10px]">Cmd + V</kbd> để dán ảnh tức thì!
                  </span>
                </div>
              </div>

              {/* Editable Text Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
                  <span>Lời giới thiệu & Nội dung lý thuyết</span>
                  <span className="text-[11px] text-zinc-500 font-normal">Gõ văn bản tự nhiên, ảnh đã dán sẽ hiện bên dưới</span>
                </label>
                <Textarea
                  ref={textareaRef}
                  value={contentMarkdown}
                  onChange={(e) => {
                    setContentMarkdown(e.target.value);
                    setSaveState("unsaved");
                  }}
                  rows={4}
                  placeholder="Nhập nội dung giải thích, kiến thức bài học hoặc ghi chú cho học viên ở đây..."
                  className="bg-zinc-950 border-zinc-800 text-sm leading-relaxed"
                />
              </div>

              {/* Visual Rendered Landing View of Content and Photos */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#2997ff]" />
                    Xem Trước Giao Diện Học Viên (Dạng Landing Page)
                  </h4>
                  <span className="text-[11px] text-zinc-400">
                    {imagesList.length} hình ảnh minh họa trong bài
                  </span>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 space-y-6">
                  {/* Lesson Heading in Preview */}
                  <div className="border-b border-zinc-800/80 pb-4">
                    <span className="text-[11px] font-mono uppercase text-[#2997ff] tracking-widest font-semibold">
                      Kiến Thức Bài Học
                    </span>
                    <h2 className="text-xl font-bold text-white mt-1">{title || "Tiêu đề bài học"}</h2>
                    {description && (
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{description}</p>
                    )}
                  </div>

                  {/* Flow of Blocks: Paragraphs + Visual Clickable Images */}
                  {contentMarkdown.trim() ? (
                    <div className="space-y-5">
                      {contentMarkdown.split("\n\n").map((block, idx) => {
                        const imgMatch = block.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
                        if (imgMatch) {
                          const alt = imgMatch[1] || "Hình ảnh bài giảng";
                          const url = imgMatch[2];

                          return (
                            <div
                              key={idx}
                              className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden hover:border-zinc-700 transition-all shadow-lg"
                            >
                              {/* Top Bar for each image card */}
                              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <ImageIcon className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
                                  <span className="font-semibold text-zinc-200 truncate">{alt}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => openLightbox(url, alt)}
                                    className="h-7 text-xs text-[#2997ff] hover:bg-[#0071e3]/20 hover:text-white gap-1"
                                    title="Phóng to xem chi tiết"
                                  >
                                    <ZoomIn className="w-3.5 h-3.5" /> Phóng to chi tiết
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteImage(block)}
                                    className="h-7 w-7 p-0 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
                                    title="Xóa ảnh này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </div>

                              {/* Clickable Image Body */}
                              <div
                                onClick={() => openLightbox(url, alt)}
                                className="p-3 flex flex-col items-center justify-center cursor-zoom-in relative bg-black/40 group/img"
                              >
                                <img
                                  src={url}
                                  alt={alt}
                                  className="max-h-[520px] w-auto max-w-full rounded-xl object-contain shadow-md transition-transform duration-200 group-hover/img:scale-[1.01]"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-colors pointer-events-none">
                                  <span className="opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20">
                                    <ZoomIn className="w-3.5 h-3.5 text-[#2997ff]" /> Nhấp để phóng to / kéo xem chi tiết
                                  </span>
                                </div>
                              </div>

                              {alt && (
                                <div className="px-4 py-2 border-t border-zinc-800/60 bg-zinc-950/60 text-center">
                                  <p className="text-xs text-zinc-400 italic">
                                    Minh họa: {alt}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (block.startsWith("### ")) {
                          return (
                            <h3 key={idx} className="text-base font-bold text-white pt-2 border-l-2 border-[#0071e3] pl-3">
                              {block.replace("### ", "")}
                            </h3>
                          );
                        }
                        if (block.startsWith("## ")) {
                          return (
                            <h2 key={idx} className="text-lg font-bold text-white pt-3 border-l-2 border-white pl-3">
                              {block.replace("## ", "")}
                            </h2>
                          );
                        }

                        return (
                          <p key={idx} className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                            {block}
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      Chưa có nội dung mô tả hoặc hình ảnh nào. Hãy nhập văn bản ở trên hoặc dán ảnh từ máy tính vào!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: SPLIT VIEW (Side by Side) */}
          {viewMode === "split" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Editor */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <Textarea
                  ref={textareaRef}
                  value={contentMarkdown}
                  onChange={(e) => {
                    setContentMarkdown(e.target.value);
                    setSaveState("unsaved");
                  }}
                  rows={16}
                  placeholder="Soạn thảo Markdown..."
                  className="w-full bg-transparent border-0 focus-visible:ring-0 p-2 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-600 resize-none font-mono"
                />
              </div>

              {/* Right: Live Preview */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 overflow-y-auto max-h-[500px] space-y-4">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pb-2 border-b border-zinc-800">
                  Xem Trước Trực Tiếp
                </div>
                {contentMarkdown.split("\n\n").map((block, idx) => {
                  const imgMatch = block.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
                  if (imgMatch) {
                    return (
                      <div
                        key={idx}
                        onClick={() => openLightbox(imgMatch[2], imgMatch[1])}
                        className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/60 p-2 cursor-pointer hover:border-[#0071e3]"
                      >
                        <img
                          src={imgMatch[2]}
                          alt={imgMatch[1]}
                          className="max-h-[300px] w-auto mx-auto rounded object-contain"
                        />
                        {imgMatch[1] && (
                          <p className="text-center text-[10px] text-zinc-400 mt-1 italic">{imgMatch[1]}</p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-xs text-zinc-300 leading-relaxed">
                      {block}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 3: RAW MARKDOWN */}
          {viewMode === "markdown" && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <Textarea
                ref={textareaRef}
                value={contentMarkdown}
                onChange={(e) => {
                  setContentMarkdown(e.target.value);
                  setSaveState("unsaved");
                }}
                rows={16}
                placeholder="### Tiêu đề bài học&#10;Soạn thảo mã Markdown..."
                className="w-full bg-transparent border-0 focus-visible:ring-0 p-3 text-xs leading-relaxed text-zinc-100 placeholder:text-zinc-600 font-mono resize-y"
              />
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-zinc-800">
          <Button
            type="submit"
            className="font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-[#0071e3]/20 px-5"
          >
            <Save className="w-4 h-4 mr-1.5" /> Lưu Nội Dung Bài Học
          </Button>
        </div>
      </form>

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={lightboxImage.url}
        title={lightboxImage.title}
      />
    </div>
  );
}
