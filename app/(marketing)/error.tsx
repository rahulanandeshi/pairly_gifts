"use client";

import * as React from "react";
import { WarningIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <WarningIcon size={22} weight="duotone" />
      </span>
      <h2 className="font-display text-2xl">Something went wrong</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        We hit an unexpected error loading this page. Please try again.
      </p>
      <Button onClick={reset} className="mt-2 h-10 cursor-pointer rounded-full px-5">
        <ArrowClockwiseIcon size={15} /> Try again
      </Button>
    </div>
  );
}
