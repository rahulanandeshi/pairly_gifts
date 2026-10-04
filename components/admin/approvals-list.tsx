"use client";

import * as React from "react";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { approveCard, rejectCard } from "@/app/admin/actions";

interface PendingCard {
  id: string;
  title: string;
  occasionSlug: string;
  paletteFrom: string;
  paletteTo: string;
  createdAt: string;
  creatorName: string;
}

export function ApprovalsList({ cards }: { cards: PendingCard[] }) {
  const [items, setItems] = React.useState(cards);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = React.useState<PendingCard | null>(null);
  const [reason, setReason] = React.useState("");

  const handleApprove = async (id: string) => {
    setPendingId(id);
    const result = await approveCard(id);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== id));
    toast.success("Card approved.");
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setPendingId(rejectTarget.id);
    const result = await rejectCard(rejectTarget.id, reason);
    setPendingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setItems((prev) => prev.filter((c) => c.id !== rejectTarget.id));
    toast.success("Card rejected.");
    setRejectTarget(null);
    setReason("");
  };

  if (items.length === 0) {
    return <EmptyState title="All caught up" description="No cards are currently awaiting approval." />;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c) => (
          <GlassPanel key={c.id} className="flex flex-col gap-3 p-5">
            <span className="h-28 w-full rounded-xl" style={{ background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }} />
            <div>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {c.occasionSlug.replace(/-/g, " ")} · by {c.creatorName} · {c.createdAt}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={pendingId === c.id}
                onClick={() => handleApprove(c.id)}
                className="flex-1 cursor-pointer gap-1 rounded-full text-xs"
              >
                <CheckIcon size={12} weight="bold" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pendingId === c.id}
                onClick={() => setRejectTarget(c)}
                className="flex-1 cursor-pointer gap-1 rounded-full text-xs text-destructive"
              >
                <XIcon size={12} weight="bold" /> Reject
              </Button>
            </div>
          </GlassPanel>
        ))}
      </div>

      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject &ldquo;{rejectTarget?.title}&rdquo;?</DialogTitle>
            <DialogDescription>Optionally tell the creator what to fix — they&apos;ll get this in an email.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Illustration doesn't match the occasion tag…"
            rows={3}
          />
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="cursor-pointer rounded-full" />}>Cancel</DialogClose>
            <Button
              disabled={pendingId === rejectTarget?.id}
              onClick={handleReject}
              className="cursor-pointer rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reject Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
