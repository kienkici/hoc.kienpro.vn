import { Download, FileText, FileArchive, Link as LinkIcon } from "lucide-react";
import { MockLessonResource } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

interface LessonResourcesProps {
  resources: MockLessonResource[];
}

export function LessonResources({ resources }: LessonResourcesProps) {
  if (resources.length === 0) {
    return (
      <div className="text-center text-xs text-zinc-500 py-6">
        Bài học này không có tài liệu đính kèm.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {resources.map((res) => (
        <div
          key={res.id}
          className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center text-gold-400">
              {res.fileType === "pdf" ? (
                <FileText className="w-5 h-5" />
              ) : res.fileType === "zip" ? (
                <FileArchive className="w-5 h-5" />
              ) : (
                <LinkIcon className="w-5 h-5" />
              )}
            </div>
            <div>
              <h5 className="text-xs font-semibold text-white">{res.title}</h5>
              <span className="text-[10px] text-zinc-400">{res.fileSize}</span>
            </div>
          </div>

          <Button size="sm" variant="outline" className="text-xs gap-1.5" asChild>
            <a href={res.fileUrl} download>
              <Download className="w-3.5 h-3.5 text-gold-400" /> Tải Về
            </a>
          </Button>
        </div>
      ))}
    </div>
  );
}
