"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Upload,
  Link as LinkIcon,
  FileArchive,
  Save,
  Eye,
  Loader2,
  CheckCircle2,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
} from "lucide-react";
import { Lesson, LessonResource, ResourceType } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generateId } from "@/lib/admin-mock-data";
import { SaveIndicator, SaveState } from "../SaveIndicator";
import { saveLessonResources } from "@/server/actions/course";
import { toast } from "sonner";

interface ResourceManagerTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function ResourceManagerTab({ lesson, onSaveMock }: ResourceManagerTabProps) {
  const [resources, setResources] = useState<LessonResource[]>(lesson.resources || []);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  // Keep local resources synced when parent refreshes
  useEffect(() => {
    if (lesson.resources) {
      setResources(lesson.resources);
    }
  }, [lesson.resources]);

  // Form for new resource
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("pdf");
  const [externalUrl, setExternalUrl] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto detect type & populate title from file
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    if (!title.trim()) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      setTitle(nameWithoutExt);
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") setResourceType("pdf");
    else if (["zip", "rar", "7z"].includes(ext || "")) setResourceType("zip");
    else if (["doc", "docx"].includes(ext || "")) setResourceType("docx");
    else if (["xls", "xlsx"].includes(ext || "")) setResourceType("xlsx");
    else if (["ppt", "pptx"].includes(ext || "")) setResourceType("pptx");
    else if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) setResourceType("image" as any);
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Vui lòng nhập tên tài liệu.");
      return;
    }

    let fileUrl = externalUrl;
    let fileSize = 0;
    let fileName = title;

    if (resourceType !== "link") {
      if (!selectedFile) {
        toast.error("Vui lòng chọn một file từ máy tính để tải lên.");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("folder", "resources");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Tải file thất bại");
        }

        fileUrl = data.url;
        fileSize = data.fileSize;
        fileName = data.fileName;
        toast.success(`Đã tải file "${data.fileName}" lên hệ thống thành công!`);
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi tải file lên máy chủ.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    const newRes: LessonResource = {
      id: generateId("res"),
      lessonId: lesson.id,
      title: title.trim(),
      description: "",
      resourceType,
      storagePath: fileUrl,
      externalUrl: fileUrl,
      fileName,
      mimeType: selectedFile?.type || "application/octet-stream",
      fileSize: fileSize || (selectedFile?.size || 1024000),
      allowDownload,
      orderIndex: resources.length,
      status: "ready",
      createdAt: new Date().toISOString(),
    };

    const updatedList = [...resources, newRes];
    setResources(updatedList);
    setTitle("");
    setExternalUrl("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Auto save to DB
    setSaveState("saving");
    const saveRes = await saveLessonResources(lesson.id, updatedList);
    if (saveRes.success) {
      setSaveState("saved");
      onSaveMock({ resources: updatedList });
      toast.success("Đã lưu tài liệu vào bài học!");
    } else {
      setSaveState("unsaved");
      toast.error(saveRes.error || "Không lưu được vào cơ sở dữ liệu");
    }
  };

  const handleDelete = async (id: string) => {
    const updated = resources.filter((r) => r.id !== id);
    setResources(updated);
    setSaveState("saving");
    const saveRes = await saveLessonResources(lesson.id, updated);
    if (saveRes.success) {
      setSaveState("saved");
      onSaveMock({ resources: updated });
      toast.success("Đã xóa tài liệu!");
    } else {
      setSaveState("unsaved");
    }
  };

  const handleSaveAll = async () => {
    setSaveState("saving");
    const saveRes = await saveLessonResources(lesson.id, resources);
    if (saveRes.success) {
      setSaveState("saved");
      onSaveMock({ resources });
      toast.success("Lưu toàn bộ tài liệu thành công!");
    } else {
      setSaveState("unsaved");
      toast.error(saveRes.error || "Lỗi khi lưu tài liệu");
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-rose-400" />;
      case "zip":
        return <FileArchive className="w-4 h-4 text-amber-400" />;
      case "docx":
      case "doc":
        return <FileText className="w-4 h-4 text-sky-400" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case "pptx":
      case "ppt":
        return <Presentation className="w-4 h-4 text-orange-400" />;
      case "image":
        return <ImageIcon className="w-4 h-4 text-purple-400" />;
      case "link":
        return <LinkIcon className="w-4 h-4 text-[#2997ff]" />;
      default:
        return <FileText className="w-4 h-4 text-zinc-400" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-2xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white">3. Quản Lý Tài Liệu Đính Kèm (Resource Manager)</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tải tài liệu từ máy tính lên hệ thống để học viên có thể xem trực tiếp hoặc tải về khi học.
          </p>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.png,.jpg,.jpeg,.webp,.txt"
      />

      {/* Add New Resource Form */}
      <form onSubmit={handleAddResource} className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thêm Tài Liệu Mới</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Tên tài liệu *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Slide bài giảng, Bộ từ vựng Ads..."
              className="text-xs bg-zinc-900 border-zinc-800"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">Định dạng file</label>
            <Select value={resourceType} onValueChange={(val) => setResourceType(val as ResourceType)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs">
                <SelectValue placeholder="Loại tài liệu" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
                <SelectItem value="pdf">File PDF</SelectItem>
                <SelectItem value="docx">File Word (DOC / DOCX)</SelectItem>
                <SelectItem value="xlsx">File Excel (XLSX)</SelectItem>
                <SelectItem value="pptx">File PowerPoint (PPTX)</SelectItem>
                <SelectItem value="zip">File Nén (ZIP / RAR / 7Z)</SelectItem>
                <SelectItem value="image">Hình ảnh minh họa</SelectItem>
                <SelectItem value="link">Liên kết ngoài (Google Drive, Notion...)</SelectItem>
                <SelectItem value="prompt">Bộ Prompt AI</SelectItem>
                <SelectItem value="template">Mẫu Template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Picker or Link URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-zinc-400">
              {resourceType === "link" ? "Đường dẫn liên kết *" : "Tập tin từ máy tính *"}
            </label>
            {resourceType === "link" ? (
              <Input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="text-xs bg-zinc-900 border-zinc-800"
                required
              />
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between gap-2 border border-dashed border-zinc-700 hover:border-[#0071e3] rounded-md px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/60 text-xs text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Upload className="w-3.5 h-3.5 text-[#2997ff] shrink-0" />
                  <span className="truncate">
                    {selectedFile ? selectedFile.name : "Nhấp để chọn file từ máy..."}
                  </span>
                </div>
                {selectedFile && (
                  <span className="text-[10px] text-zinc-400 shrink-0 font-mono">
                    {formatFileSize(selectedFile.size)}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-zinc-900">
          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
            <span>Cho phép học viên tải file về máy</span>
          </label>

          <Button
            type="submit"
            disabled={isUploading}
            size="sm"
            className="font-semibold text-xs bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-[#0071e3]/30"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Đang tải file lên...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Tài Liệu
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Resource List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Danh Sách Tài Liệu Hiện Có ({resources.length})
        </h4>

        {resources.length === 0 ? (
          <div className="text-center text-xs text-zinc-500 py-10 border border-dashed border-zinc-800 rounded-xl">
            Chưa có tài liệu đính kèm nào. Hãy chọn file từ máy tính phía trên để tải lên.
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map((res) => {
              const fileHref = res.externalUrl || res.storagePath || "#";
              return (
                <div
                  key={res.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-950 text-xs gap-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                      {getFileIcon(res.resourceType)}
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-semibold text-white truncate text-sm">{res.title}</h5>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                        <span className="uppercase font-mono text-zinc-500">{res.resourceType}</span>
                        <span>•</span>
                        <span>{formatFileSize(res.fileSize)}</span>
                        {res.allowDownload ? (
                          <span className="text-emerald-400 font-medium">• Cho phép tải về</span>
                        ) : (
                          <span className="text-zinc-500">• Chỉ xem trực tuyến</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* View directly */}
                    <Button variant="outline" size="sm" asChild className="h-8 text-xs border-zinc-700 hover:border-white/20">
                      <a href={fileHref} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-3.5 h-3.5 mr-1 text-[#2997ff]" /> Xem trực tiếp
                      </a>
                    </Button>

                    {/* Download */}
                    {res.allowDownload && (
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs border-zinc-700 hover:border-white/20">
                        <a href={fileHref} download={res.fileName || res.title} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Tải về
                        </a>
                      </Button>
                    )}

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(res.id)}
                      className="h-8 w-8 text-zinc-400 hover:text-red-400"
                      title="Xóa tài liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} className="font-semibold bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-[#0071e3]/20">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Tài Liệu
        </Button>
      </div>
    </div>
  );
}
