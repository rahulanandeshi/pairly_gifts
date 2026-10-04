"use client";

import * as React from "react";
import { toast } from "sonner";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendFollowUpEmail } from "@/app/gift/actions";

export function FollowUpComposer({ greetingId, recipientName }: { greetingId: string; recipientName: string }) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSend = async () => {
    setSending(true);
    const result = await sendFollowUpEmail(greetingId, message);
    setSending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setSent(true);
    setOpen(false);
    toast.success("Email sent!");
  };

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)} disabled={sent} className="cursor-pointer gap-1.5 rounded-full">
        <PaperPlaneRightIcon size={14} /> {sent ? "Email Sent" : `Reply to ${recipientName} by Email`}
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={`Write a quick note to ${recipientName}…`} rows={3} />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer rounded-full text-sm">
          Cancel
        </Button>
        <Button disabled={sending || !message.trim()} onClick={handleSend} className="cursor-pointer gap-1.5 rounded-full text-sm">
          <PaperPlaneRightIcon size={13} /> {sending ? "Sending…" : "Send Email"}
        </Button>
      </div>
    </div>
  );
}
