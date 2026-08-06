"use client";

import { useState } from "react";
import { Plus, Trash2, FileText, Download, Upload, Link as LinkIcon, FileArchive, Edit, Save } from "lucide-react";
import { Lesson, LessonResource, ResourceType } from "@/types/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { generateId } from "@/lib/admin-mock-data";
import { SaveIndicator, SaveState } from "../SaveIndicator";

interface ResourceManagerTabProps {
  lesson: Lesson;
  onSaveMock: (updated: Partial<Lesson>) => void;
}

export function ResourceManagerTab({ lesson, onSaveMock }: ResourceManagerTabProps) {
  const [resources, setResources] = useState<LessonResource[]>(lesson.resources || []);
  const [saveState, setSaveState] = useState<SaveState>("saved");

  // Form for new resource
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceType>("pdf");
  const [externalUrl, setExternalUrl] = useState("");
  const [allowDownload, setAllowDownload] = useState(true);

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newRes: LessonResource = {
      id: generateId("res"),
      lessonId: lesson.id,
      title,
      description: "",
      resourceType,
      storagePath: `/resources/${title.toLowerCase().replace(/\s+/g, "-")}.${resourceType}`,
      externalUrl: resourceType === "link" ? externalUrl : "",
      fileName: `${title}.${resourceType}`,
      mimeType: "application/octet-stream",
      fileSize: 2500000,
      allowDownload,
      orderIndex: resources.length,
      status: "ready",
      createdAt: new Date().toISOString(),
    };

    setResources([...resources, newRes]);
    setTitle("");
    setExternalUrl("");
    setSaveState("unsaved");
  };

  const handleDelete = (id: string) => {
    setResources(resources.filter((r) => r.id !== id));
    setSaveState("unsaved");
  };

  const handleSaveAll = () => {
    setSaveState("saving");
    setTimeout(() => {
      onSaveMock({ resources });
      setSaveState("saved");
    }, 600);
  };

  return (
    <div className="space-y-6 bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-base font-bold text-white">3. Quản Lý Tài Liệu Đính Kèm (Resource Manager)</h3>
        <SaveIndicator state={saveState} />
      </div>

      {/* Add New Resource Form */}
      <form onSubmit={handleAddResource} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Thêm Tài Liệu Mới</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tên tài liệu đính kèm..."
            className="text-xs"
            required
          />
          <Select value={resourceType} onValueChange={(val) => setResourceType(val as ResourceType)}>
            <SelectTrigger className="bg-zinc-900 border-zinc-800 text-xs">
              <SelectValue placeholder="Loại tài liệu" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-xs">
              <SelectItem value="pdf">File PDF</SelectItem>
              <SelectItem value="zip">File ZIP / RAR</SelectItem>
              <SelectItem value="docx">File Word (DOCX)</SelectItem>
              <SelectItem value="xlsx">File Excel (XLSX)</SelectItem>
              <SelectItem value="pptx">File PowerPoint (PPTX)</SelectItem>
              <SelectItem value="link">Liên kết bên ngoài (Link)</SelectItem>
              <SelectItem value="prompt">Bộ Prompt AI</SelectItem>
              <SelectItem value="template">Mẫu Template</SelectItem>
            </SelectContent>
          </Select>

          {resourceType === "link" ? (
            <Input
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://..."
              className="text-xs"
              required
            />
          ) : (
            <div className="flex items-center gap-2 border border-zinc-800 rounded px-3 bg-zinc-900 text-xs text-zinc-400">
              <Upload className="w-3.5 h-3.5" /> Select File Mock
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
            <span>Cho phép học viên tải về</span>
          </label>
          <Button type="submit" variant="gold" size="sm" className="font-bold text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Tài Liệu
          </Button>
        </div>
      </form>

      {/* Resource List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Danh Sách Tài Liệu Hiện Có ({resources.length})</h4>

        {resources.length === 0 ? (
          <div className="text-center text-xs text-zinc-500 py-6 border border-dashed border-zinc-800 rounded-lg">
            Chưa có tài liệu đính kèm nào cho bài học này.
          </div>
        ) : (
          resources.map((res) => (
            <div key={res.id} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-950 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gold-400">
                  {res.resourceType === "pdf" ? <FileText className="w-4 h-4" /> : <FileArchive className="w-4 h-4" />}
                </div>
                <div>
                  <h5 className="font-semibold text-white">{res.title}</h5>
                  <span className="text-[10px] text-zinc-500">{res.resourceType.toUpperCase()} • {(res.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleDelete(res.id)}>
                  <Trash2 className="w-3.5 h-3.5 text-zinc-500 hover:text-red-400" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-zinc-800">
        <Button onClick={handleSaveAll} variant="gold" className="font-bold">
          <Save className="w-4 h-4 mr-1.5" /> Lưu Tài Liệu
        </Button>
      </div>
    </div>
  );
}
