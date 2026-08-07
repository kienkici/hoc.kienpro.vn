"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Upload, LayoutGrid, LayoutList, Film, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { MediaGrid } from "@/components/admin/MediaGrid";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { MediaAsset } from "@/types/admin";
import { toast } from "sonner";

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Confirm delete state
  const [deletingAsset, setDeletingAsset] = useState<MediaAsset | null>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("media_assets")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const mapped = (data || []).map((m: any) => ({
      id: m.id,
      type: m.asset_type,
      title: m.title,
      fileName: m.file_name || "",
      fileSize: Number(m.file_size) || 0,
      mimeType: m.mime_type || "",
      url: m.storage_path || "",
      thumbnailUrl: m.thumbnail_url || "",
      status: m.status,
      provider: m.provider,
      resolution: "1080p",
      durationSeconds: m.duration_seconds || 0,
      usedInLessons: [],
      createdAt: m.created_at,
    }));

    setAssets(mapped as any);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleRealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("media")
        .getPublicUrl(fileName);

      let type = "document";
      if (file.type.startsWith("image/")) {
        type = "image";
      } else if (file.type.startsWith("video/")) {
        type = "video";
      }

      const { error: dbError } = await supabase.from("media_assets").insert({
        asset_type: type,
        title: file.name,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: publicUrl,
        thumbnail_url: type === "image" ? publicUrl : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400",
        status: "ready",
        provider: "supabase",
      });

      if (dbError) throw dbError;

      toast.success("Tải tài nguyên lên thành công!");
      fetchMedia();
    } catch (err: any) {
      console.error("Lỗi khi tải file:", err);
      toast.error("Lỗi tải lên: " + err.message);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("media_assets")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", deletingAsset.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Xóa tài nguyên khỏi thư viện thành công!");
      fetchMedia();
    }
    setDeletingAsset(null);
  };

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === "all" || a.type === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thư Viện Media"
        description="Quản lý tập trung các Video, Tài liệu PDF/ZIP và Hình ảnh trong toàn bộ khóa học."
      >
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            id="media-file-input" 
            className="hidden" 
            accept="image/*,video/*,application/pdf"
            onChange={handleRealUpload}
          />
          <Button 
            variant="gold" 
            size="sm" 
            onClick={() => document.getElementById("media-file-input")?.click()} 
            className="font-bold"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Upload Media Mới
          </Button>
        </div>
      </PageHeader>

      {/* FILTER & TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên file hoặc tiêu đề..."
            className="pl-9 bg-zinc-950 border-zinc-800 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex border border-zinc-800 rounded-lg p-0.5 bg-zinc-950">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${viewMode === "grid" ? "bg-zinc-800 text-gold-400" : "text-zinc-400 hover:text-white"}`}
              title="Dạng Lưới"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${viewMode === "list" ? "bg-zinc-800 text-gold-400" : "text-zinc-400 hover:text-white"}`}
              title="Dạng Bảng"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MEDIA TABS */}
      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="all" className="text-xs py-1.5 px-3">Tất cả Media ({assets.length})</TabsTrigger>
          <TabsTrigger value="video" className="text-xs py-1.5 px-3 gap-1"><Film className="w-3.5 h-3.5 text-gold-400" /> Video</TabsTrigger>
          <TabsTrigger value="document" className="text-xs py-1.5 px-3 gap-1"><FileText className="w-3.5 h-3.5" /> Tài liệu</TabsTrigger>
          <TabsTrigger value="image" className="text-xs py-1.5 px-3 gap-1"><ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
            </div>
          ) : (
            <MediaGrid
              assets={filteredAssets}
              viewMode={viewMode}
              onDeleteRequest={setDeletingAsset}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Media Asset"
        description={`Bạn có chắc chắn muốn xóa file media "${deletingAsset?.title}" khỏi thư viện?`}
        confirmText="Xóa File Media"
        variant="destructive"
      />
    </div>
  );
}
