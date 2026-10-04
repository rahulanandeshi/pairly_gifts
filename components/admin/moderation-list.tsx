"use client";

import * as React from "react";
import { toast } from "sonner";
import { CardsIcon, ArrowCounterClockwiseIcon, TrashIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { restoreRejectedCard, deleteRejectedCard } from "@/app/admin/actions";

interface ModerationItem {
  id: string;
  title: string;
  reason: string | null;
  submittedBy: string;
  date: string;
}

export function ModerationList({ items }: { items: ModerationItem[] }) {
  const [rows, setRows] = React.useState(items);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleRestore = async (id: string) => {
    setPendingId(id);
    const result = await restoreRejectedCard(id);
    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Card restored for review.");
  };

  const handleDelete = async (id: string) => {
    setPendingId(id);
    const result = await deleteRejectedCard(id);
    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success("Card deleted.");
  };

  if (rows.length === 0) {
    return <EmptyState title="Nothing to review" description="Rejected cards will show up here." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((m) => (
        <GlassPanel key={m.id} className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
            <CardsIcon size={19} weight="duotone" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{m.title}</p>
            <p className="text-xs text-muted-foreground">Rejected card · {m.submittedBy} · {m.date}</p>
            {m.reason && <p className="mt-1 text-xs text-coral">{m.reason}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" disabled={pendingId === m.id} onClick={() => handleRestore(m.id)} className="cursor-pointer gap-1 rounded-full text-xs">
              <ArrowCounterClockwiseIcon size={12} weight="bold" /> Restore for Review
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pendingId === m.id}
              onClick={() => handleDelete(m.id)}
              className="cursor-pointer gap-1 rounded-full text-xs text-destructive"
            >
              <TrashIcon size={12} weight="bold" /> Delete
            </Button>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
