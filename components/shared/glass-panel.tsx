import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: "div" | "section" | "article";
}

export function GlassPanel({ className, as = "div", ...props }: GlassPanelProps) {
  const Comp = as;
  return (
    <Comp
      className={cn(
        "glass-panel rounded-3xl shadow-[0_8px_40px_-16px_rgba(11,18,32,0.25)]",
        className,
      )}
      {...props}
    />
  );
}
