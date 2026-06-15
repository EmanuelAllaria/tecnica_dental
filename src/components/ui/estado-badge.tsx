import { ESTADO_COLORS, ESTADO_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface EstadoBadgeProps {
  estado: string;
  className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ESTADO_COLORS[estado] || "bg-ivory/10 text-ivory/70 border-ivory/20",
        className
      )}
    >
      {ESTADO_LABELS[estado] || estado}
    </span>
  );
}
