"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { syncGiftCardCatalog } from "@/app/admin/actions";

export function SyncCatalogButton({ configured }: { configured: boolean }) {
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    setSyncing(true);
    const result = await syncGiftCardCatalog();
    setSyncing(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success(`Matched ${result.matched} of ${result.total} brands to live Tremendous products.`);
  };

  return (
    <Button
      variant="outline"
      onClick={handleSync}
      disabled={syncing || !configured}
      title={configured ? undefined : "Set TREMENDOUS_API_KEY to enable"}
      className="cursor-pointer gap-1.5 rounded-full"
    >
      <ArrowsClockwiseIcon size={14} className={syncing ? "animate-spin" : undefined} /> {syncing ? "Syncing…" : "Sync Live Catalog"}
    </Button>
  );
}
