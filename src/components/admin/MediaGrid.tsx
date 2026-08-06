"use client";

import { useState } from "react";
import { Film, FileText, Image as ImageIcon, Trash2, ExternalLink, ShieldAlert } from "lucide-react";
import { MediaAsset, MediaAssetType } from "@/types/admin";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MediaGridProps {
  assets: MediaAsset[];
  viewMode: "grid" | "list";
  onDeleteRequest: (asset: MediaAsset) => void;
}

export function MediaGrid({ assets, viewMode, onDeleteRequest }: MediaGridProps) {
  if (assets.length === 0) {
    return (
      <div className="text-center text-xs text-zinc-500 py-12 border border-dashed border-zinc-800 rounded-xl">
        Không có media nào phù hợp với bộ lọc.
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/40">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
            <tr>
              <th className="p-3">Media</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Kích Thước</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Đang Dùng Ở</th>
              <th className="p-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {assets.map((asset) => (
              <tr key={asset.id} className="hover:bg-zinc-900/80">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded bg-zinc-950 overflow-hidden border border-zinc-800 shrink-0 flex items-center justify-center">
                      {asset.thumbnailUrl ? (
                        <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
                      ) : (
                        <FileText className="w-4 h-4 text-gold-400" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white truncate max-w-xs">{asset.title}</h5>
                      <span className="text-[10px] text-zinc-500">{asset.fileName}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3 capitalize">{asset.type}</td>
                <td className="p-3">{(asset.fileSize / 1024 / 1024).toFixed(1)} MB</td>
                <td className="p-3 font-semibold text-gold-400 uppercase">{asset.provider}</td>
                <td className="p-3">
                  {asset.usedInLessons.length > 0 ? (
                    <Badge variant="gold" className="text-[10px]">
                      {asset.usedInLessons.length} bài học
                    </Badge>
                  ) : (
                    <span className="text-zinc-500">Chưa sử dụng</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDeleteRequest(asset)}>
                    <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden group space-y-2 p-3">
          <div className="relative aspect-video w-full rounded-lg bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center">
            {asset.thumbnailUrl ? (
              <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <FileText className="w-8 h-8 text-gold-400" />
            )}
            {asset.type === "video" && (
              <Badge variant="gold" className="absolute bottom-2 right-2 text-[9px] py-0">
                {formatDuration(asset.durationSeconds)}
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <h5 className="font-semibold text-xs text-white truncate">{asset.title}</h5>
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <span className="uppercase font-bold text-gold-400">{asset.provider}</span>
              <span>{(asset.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
            {asset.usedInLessons.length > 0 ? (
              <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Đang dùng ({asset.usedInLessons.length})
              </span>
            ) : (
              <span className="text-[10px] text-zinc-500">Chưa dùng</span>
            )}
            <button onClick={() => onDeleteRequest(asset)} className="text-zinc-500 hover:text-red-400 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
