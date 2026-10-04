import * as React from "react";
import { GlassPanel } from "@/components/shared/glass-panel";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <GlassPanel className="w-full max-w-md p-8 sm:p-10">
      <h1 className="text-balance text-center font-display text-3xl">{title}</h1>
      {description ? <p className="mt-2 text-center text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div> : null}
    </GlassPanel>
  );
}
