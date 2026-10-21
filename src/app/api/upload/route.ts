import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "resources";

    if (!file) {
      return NextResponse.json({ success: false, error: "Không tìm thấy file tải lên." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase();
    const baseName = path
      .basename(originalName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-");

    const uniqueName = `${Date.now()}_${baseName}${extension}`;

    // Determine clean file type
    let fileType = "other";
    if ([".pdf"].includes(extension)) fileType = "pdf";
    else if ([".doc", ".docx"].includes(extension)) fileType = "doc";
    else if ([".xls", ".xlsx"].includes(extension)) fileType = "xlsx";
    else if ([".ppt", ".pptx"].includes(extension)) fileType = "pptx";
    else if ([".zip", ".rar", ".7z", ".tar", ".gz"].includes(extension)) fileType = "zip";
    else if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(extension)) fileType = "image";
    else if ([".mp4", ".mov", ".avi"].includes(extension)) fileType = "video";

    let publicUrl = "";

    // 1. Ưu tiên upload trực tiếp lên Cloud Supabase Storage để hoạt động độc lập trên Production
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const bucket = folder === "images" ? "media" : "resources";
        const { error: uploadError } = await supabase.storage.from(bucket).upload(uniqueName, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

        if (!uploadError) {
          const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(uniqueName);
          publicUrl = pubData.publicUrl;
        } else {
          console.warn("Supabase Storage upload warning, falling back to local:", uploadError);
        }
      } catch (cloudErr) {
        console.warn("Cloud storage connection error, falling back to local:", cloudErr);
      }
    }

    // 2. Fallback lưu local nếu cloud không khả dụng
    if (!publicUrl) {
      const targetDir = path.join(process.cwd(), "public", "uploads", folder);
      const targetFilePath = path.join(targetDir, uniqueName);
      await writeFile(targetFilePath, buffer);
      publicUrl = `/uploads/${folder}/${uniqueName}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: file.size,
      fileType,
      mimeType: file.type || "application/octet-stream",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi tải file lên hệ thống." }, { status: 500 });
  }
}
