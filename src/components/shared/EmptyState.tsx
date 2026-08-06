import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 my-4",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-zinc-800/80 flex items-center justify-center mb-4 text-gold-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 max-w-sm mb-6">{description}</p>
      {actionText && (
        <Button
          onClick={onAction}
          variant="gold"
          size="sm"
          asChild={!!actionHref}
        >
          {actionHref ? <a href={actionHref}>{actionText}</a> : actionText}
        </Button>
      )}
    </div>
  );
}
