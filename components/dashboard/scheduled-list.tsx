"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClockCountdownIcon, XCircleIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { cancelScheduledGreeting } from "@/app/dashboard/actions";

interface ScheduledGreeting {
  id: string;
  recipientName: string;
  scheduledFor: Date | null;
  card: { title: string; paletteFrom: string; paletteTo: string };
}

export function ScheduledList({ greetings }: { greetings: ScheduledGreeting[] }) {
  const router = useRouter();
  const [cancelingId, setCancelingId] = React.useState<string | null>(null);

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    const result = await cancelScheduledGreeting(id);
    setCancelingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Delivery canceled.");
    router.refresh();
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {greetings.map((c) => (
        <GlassPanel key={c.id} className="flex flex-col gap-3 p-5">
          <span className="h-20 w-full rounded-xl" style={{ background: `linear-gradient(135deg, ${c.card.paletteFrom}, ${c.card.paletteTo})` }} />
          <div>
            <p className="text-sm font-medium">{c.card.title}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ClockCountdownIcon size={13} /> Arriving {c.scheduledFor ? c.scheduledFor.toLocaleString() : "soon"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">To {c.recipientName}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={cancelingId === c.id}
            onClick={() => handleCancel(c.id)}
            className="cursor-pointer gap-1.5 rounded-full text-xs"
          >
            <XCircleIcon size={13} /> {cancelingId === c.id ? "Canceling…" : "Cancel Delivery"}
          </Button>
        </GlassPanel>
      ))}
    </div>
  );
}
