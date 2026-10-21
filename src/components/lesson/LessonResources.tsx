import { useState } from "react";
import {
  Download,
  FileText,
  FileArchive,
  Link as LinkIcon,
  Eye,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageLightboxModal } from "@/components/shared/ImageLightboxModal";

interface LessonResourcesProps {
  resources: any[];
}

export function LessonResources({ resources }: LessonResourcesProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState({ url: "", title: "" });

  if (!resources || resources.length === 0) {
    return (
      <div className="text-center text-xs text-zinc-500 py-10 border border-dashed border-zinc-800 rounded-xl">
        Bài học này không có tài liệu đính kèm.
      </div>
    );
  }

  const getFileIcon = (res: any) => {
    const t = (res.resource_type || res.file_type || res.fileType || "").toLowerCase();
    const mime = (res.mime_type || "").toLowerCase();
    const fileName = (res.file_name || res.external_url || res.storage_path || "").toLowerCase();

    if (t === "image" || mime.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName)) {
      return <ImageIcon className="w-5 h-5 text-purple-400" />;
    }
    if (t === "pdf" || fileName.endsWith(".pdf")) return <FileText className="w-5 h-5 text-rose-400" />;
    if (["zip", "rar", "7z"].includes(t) || /\.(zip|rar|7z)$/i.test(fileName)) return <FileArchive className="w-5 h-5 text-amber-400" />;
    if (["docx", "doc"].includes(t) || /\.(docx?)$/i.test(fileName)) return <FileText className="w-5 h-5 text-sky-400" />;
    if (["xlsx", "xls"].includes(t) || /\.(xlsx?)$/i.test(fileName)) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (["pptx", "ppt"].includes(t) || /\.(pptx?)$/i.test(fileName)) return <Presentation className="w-5 h-5 text-orange-400" />;
    if (t === "link") return <LinkIcon className="w-5 h-5 text-[#2997ff]" />;
    return <FileText className="w-5 h-5 text-zinc-400" />;
  };

  const formatSize = (res: any) => {
    if (res.fileSize && typeof res.fileSize === "string") return res.fileSize;
    const bytes = res.file_size_bytes || res.file_size || res.fileSize;
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      {resources.map((res: any) => {
        const url = res.external_url || res.storage_path || res.file_url || res.fileUrl || res.externalUrl || "#";
        const rawType = (res.resource_type || res.file_type || res.fileType || "doc").toLowerCase();
        const mime = (res.mime_type || "").toLowerCase();
        const fileName = (res.file_name || url).toLowerCase();
        const isImage = rawType === "image" || mime.startsWith("image/") || /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(fileName);
        const displayType = isImage ? "IMAGE" : rawType.toUpperCase();
        const title = res.title || res.file_name || "Tài liệu đính kèm";
        const sizeStr = formatSize(res);
        const canDownload = res.allow_download !== false && res.allowDownload !== false;

        return (
          <div
            key={res.id || url}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80 transition-all gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                {getFileIcon(res)}
              </div>
              <div className="min-w-0">
                <h5 className="text-sm font-semibold text-white truncate">{title}</h5>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                  <span className="uppercase font-mono text-zinc-500">{displayType}</span>
                  {sizeStr && (
                    <>
                      <span>•</span>
                      <span>{sizeStr}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Actions for Students */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {/* View Online Button */}
              {isImage ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLightboxImage({ url, title });
                    setLightboxOpen(true);
                  }}
                  className="text-xs h-8 border-zinc-700 hover:border-[#0071e3] text-[#2997ff]"
                >
                  <ZoomIn className="w-3.5 h-3.5 mr-1.5" /> Xem Chi Tiết
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="text-xs h-8 border-zinc-700 hover:border-white/30" asChild>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-[#2997ff]" /> Xem Trực Tiếp
                  </a>
                </Button>
              )}

              {/* Download Button */}
              {canDownload && (
                <Button size="sm" asChild className="text-xs h-8 bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm shadow-[#0071e3]/30">
                  <a href={url} download={title} target="_blank" rel="noopener noreferrer">
                    <Download className="w-3.5 h-3.5 mr-1.5" /> Tải Về
                  </a>
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* Lightbox Modal for attached images */}
      <ImageLightboxModal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={lightboxImage.url}
        title={lightboxImage.title}
      />
    </div>
  );
}
