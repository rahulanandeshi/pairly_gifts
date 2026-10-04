import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <span className="relative flex size-12 items-center justify-center rounded-full bg-primary/10">
        <Spinner className="size-6" />
      </span>
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
}
