"use client";

import * as React from "react";
import { toast } from "sonner";
import { StarIcon, ProhibitIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { setUserBanned } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

interface CreatorRow {
  id: string;
  name: string;
  email: string;
  banned: boolean;
  cardsPublished: number;
  revenue: number;
  rating: number;
}

export function CreatorsGrid({ creators }: { creators: CreatorRow[] }) {
  const [rows, setRows] = React.useState(creators);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleToggle = async (id: string, banned: boolean) => {
    setPendingId(id);
    const result = await setUserBanned(id, banned);
    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, banned } : c)));
    toast.success(banned ? "Creator suspended." : "Creator reactivated.");
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((c) => (
        <GlassPanel key={c.id} className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.email}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-medium", c.banned ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")}>
              {c.banned ? "Suspended" : "Active"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{c.cardsPublished} cards</span>
            <span>${c.revenue.toLocaleString()} revenue</span>
            <span className="flex items-center gap-1"><StarIcon size={11} weight="fill" className="text-gold" /> {c.rating.toFixed(1)}</span>
          </div>
          <button
            type="button"
            disabled={pendingId === c.id}
            onClick={() => handleToggle(c.id, !c.banned)}
            className={cn(
              "inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
              c.banned ? "text-success hover:bg-success/10" : "text-destructive hover:bg-destructive/10",
            )}
          >
            {c.banned ? <CheckCircleIcon size={13} weight="bold" /> : <ProhibitIcon size={13} weight="bold" />}
            {c.banned ? "Reactivate" : "Suspend"}
          </button>
        </GlassPanel>
      ))}
    </div>
  );
}
