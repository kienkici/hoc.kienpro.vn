import { Badge } from "@/components/ui/badge";
import { COURSE_STATUS_MAP, CourseStatus } from "@/types/admin";

interface StatusBadgeProps {
  status: CourseStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const info = COURSE_STATUS_MAP[status] || { label: status, color: "secondary" };
  const variant = info.color as "default" | "gold" | "secondary" | "success" | "warning" | "destructive" | "outline";

  return (
    <Badge variant={variant} className={className}>
      {info.label}
    </Badge>
  );
}
