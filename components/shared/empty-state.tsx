import Link from "next/link";
import { SparkleIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref, icon, className }: EmptyStateProps) {
  return (
    <div className={cn("glass-panel flex flex-col items-center gap-3 rounded-3xl px-6 py-16 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon ?? <SparkleIcon size={22} weight="duotone" />}
      </span>
      <h3 className="font-display text-xl">{title}</h3>
      {description ? <p className="max-w-sm text-sm text-muted-foreground">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Button render={<Link href={actionHref} />} className="mt-2 cursor-pointer rounded-full px-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
