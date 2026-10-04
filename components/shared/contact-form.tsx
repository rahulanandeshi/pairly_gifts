"use client";

import * as React from "react";
import { toast } from "sonner";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitContactForm } from "@/app/(marketing)/contact/actions";

const TOPIC_LABELS: Record<string, string> = {
  general: "General question",
  billing: "Billing & subscriptions",
  delivery: "Card delivery issue",
  creator: "Creator Portal",
  business: "Business account",
};

export function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [topic, setTopic] = React.useState("general");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await submitContactForm({ name, email, topic, message });
    setLoading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setSent(true);
    toast.success("Message sent — we'll be in touch soon.");
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
          <PaperPlaneTiltIcon size={22} weight="fill" />
        </span>
        <h3 className="font-display text-xl">Message sent</h3>
        <p className="text-sm text-muted-foreground">We typically respond within a few hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Topic</Label>
        <Select value={topic} onValueChange={(v) => v && setTopic(v as string)}>
          <SelectTrigger className="h-11 w-full rounded-lg">
            <SelectValue>{(v: string) => TOPIC_LABELS[v] ?? v}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General question</SelectItem>
            <SelectItem value="billing">Billing & subscriptions</SelectItem>
            <SelectItem value="delivery">Card delivery issue</SelectItem>
            <SelectItem value="creator">Creator Portal</SelectItem>
            <SelectItem value="business">Business account</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" required rows={5} placeholder="How can we help?" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Button type="submit" size="lg" disabled={loading} className="mt-2 h-11 cursor-pointer self-start rounded-full px-6">
        {loading ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}
