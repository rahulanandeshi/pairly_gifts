"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TrashIcon, CopyIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { deleteSavedMessage } from "@/app/dashboard/actions";

interface SavedMessageRow {
  id: string;
  recipientName: string;
  tone: string;
  body: string;
  createdAt: Date;
}

export function SavedMessagesList({ messages }: { messages: SavedMessageRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleCopy = async (body: string) => {
    await navigator.clipboard.writeText(body);
    toast.success("Message copied.");
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteSavedMessage(id);
    setDeletingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Message deleted.");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <GlassPanel key={m.id} className="flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">For {m.recipientName} · {m.tone}</span>
            <span className="text-xs text-muted-foreground">{m.createdAt.toLocaleDateString()}</span>
          </div>
          <p className="text-sm leading-relaxed">{m.body}</p>
          <div className="mt-1 flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => handleCopy(m.body)} className="cursor-pointer gap-1.5 rounded-full text-xs">
              <CopyIcon size={13} /> Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={deletingId === m.id}
              onClick={() => handleDelete(m.id)}
              className="cursor-pointer gap-1.5 rounded-full text-xs text-destructive"
            >
              <TrashIcon size={13} /> {deletingId === m.id ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
