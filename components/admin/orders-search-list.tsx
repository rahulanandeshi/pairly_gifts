"use client";

import * as React from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface OrderRow {
  id: string;
  orderId: string;
  customer: string;
  item: string;
  amount: number;
  status: string;
  date: string;
}

export function OrdersSearchList({ orders }: { orders: OrderRow[] }) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => o.orderId.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
  }, [orders, query]);

  return (
    <>
      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlassIcon size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by order ID or customer…" className="h-10 rounded-full pl-9" />
      </div>
      {filtered.length > 0 ? (
        <GlassPanel className="overflow-hidden p-0">
          <div className="flex flex-col divide-y divide-border/60">
            {filtered.map((o) => (
              <div key={o.id} className="flex items-center gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{o.item}</p>
                  <p className="text-xs text-muted-foreground">{o.orderId} · {o.customer} · {o.date}</p>
                </div>
                <span className="shrink-0 font-medium tabular-nums">${o.amount.toFixed(2)}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                    o.status === "PAID" ? "bg-success/15 text-success" : o.status === "PENDING" ? "bg-primary/10 text-primary" : "bg-coral/15 text-coral",
                  )}
                >
                  {o.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : (
        <EmptyState title="No matching orders" description="Try a different order ID or customer name." />
      )}
    </>
  );
}
