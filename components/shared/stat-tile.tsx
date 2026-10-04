import type { IconProps } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string;
  icon?: React.ComponentType<IconProps>;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "gold" | "coral" | "success";
}

const ACCENT: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  gold: "bg-gold/15 text-gold",
  coral: "bg-coral/15 text-coral",
  success: "bg-success/15 text-success",
};

export function StatTile({ label, value, icon: Icon, trend, accent = "primary" }: StatTileProps) {
  return (
    <GlassPanel className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span className={cn("flex size-8 items-center justify-center rounded-lg", ACCENT[accent])}>
            <Icon size={15} weight="duotone" />
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl">{value}</span>
        {trend && (
          <span className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-coral")}>{trend.value}</span>
        )}
      </div>
    </GlassPanel>
  );
}
