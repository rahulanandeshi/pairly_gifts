"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { resolveSupportTicket } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-gold/15 text-gold",
  low: "bg-muted text-muted-foreground",
};
const STATUS_STYLES: Record<string, string> = {
  open: "bg-primary/10 text-primary",
  resolved: "bg-success/15 text-success",
};

interface TicketRow {
  id: string;
  subject: string;
  message: string;
  customer: string;
  email: string;
  priority: string;
  status: string;
  date: string;
}

export function SupportTicketsList({ tickets }: { tickets: TicketRow[] }) {
  const [rows, setRows] = React.useState(tickets);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setPendingId(id);
    const result = await resolveSupportTicket(id);
    setPendingId(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, status: "resolved" } : t)));
    toast.success("Ticket marked resolved.");
  };

  if (rows.length === 0) {
    return <EmptyState title="No tickets" description="Support tickets submitted via the Contact page will show up here." />;
  }

  return (
    <GlassPanel className="overflow-hidden p-0">
      <div className="flex flex-col divide-y divide-border/60">
        {rows.map((t) => (
          <div key={t.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.subject}</p>
              <p className="text-xs text-muted-foreground">{t.customer} ({t.email}) · {t.date}</p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{t.message}</p>
            </div>
            <span className={cn("w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", PRIORITY_STYLES[t.priority])}>
              {t.priority} priority
            </span>
            <span className={cn("w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize", STATUS_STYLES[t.status])}>{t.status}</span>
            {t.status === "open" && (
              <Button size="sm" disabled={pendingId === t.id} onClick={() => handleResolve(t.id)} className="w-fit shrink-0 cursor-pointer gap-1 rounded-full text-xs">
                <CheckIcon size={12} weight="bold" /> Mark Resolved
              </Button>
            )}
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
