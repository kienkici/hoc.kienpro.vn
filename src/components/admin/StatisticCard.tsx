import { cn } from "@/lib/utils";

interface StatisticCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatisticCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatisticCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 relative overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-gold-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-zinc-400 mt-1">{description}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-xs font-medium pt-1">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded",
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}
          </span>
          <span className="text-zinc-500">so với tháng trước</span>
        </div>
      )}
    </div>
  );
}
