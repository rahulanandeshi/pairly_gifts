"use client";

import * as React from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employees } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const OCCASION_LABELS: Record<string, string> = {
  birthday: "Birthday",
  anniversary: "Work Anniversary",
  holiday: "Holiday",
  recognition: "Recognition",
};

const TEMPLATE_LABELS: Record<string, string> = {
  "everyday-sunshine": "Everyday Sunshine Birthday",
  "you-did-it": "You Did It!",
  "cheers-next-chapter": "Cheers to the Next Chapter",
};

export function BulkSendClient() {
  const [selected, setSelected] = React.useState<string[]>(employees.slice(0, 4).map((e) => e.id));
  const [sent, setSent] = React.useState(false);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <GlassPanel className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <p className="text-sm font-medium">{selected.length} selected</p>
          <button type="button" onClick={() => setSelected(employees.map((e) => e.id))} className="cursor-pointer text-xs font-medium text-primary hover:underline">
            Select all
          </button>
        </div>
        <div className="flex flex-col divide-y divide-border/60">
          {employees.map((e) => (
            <label key={e.id} className="flex cursor-pointer items-center gap-3 p-4">
              <Checkbox checked={selected.includes(e.id)} onCheckedChange={() => toggle(e.id)} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{e.name}</p>
                <p className="text-xs text-muted-foreground">{e.department} · {e.role}</p>
              </div>
            </label>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="h-fit p-6">
        <h2 className="font-medium">Send Details</h2>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Occasion</label>
            <Select defaultValue="birthday">
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg">
                <SelectValue>{(v: string) => OCCASION_LABELS[v] ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="anniversary">Work Anniversary</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="recognition">Recognition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Card Template</label>
            <Select defaultValue="everyday-sunshine">
              <SelectTrigger className="mt-1.5 h-10 w-full rounded-lg">
                <SelectValue>{(v: string) => TEMPLATE_LABELS[v] ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyday-sunshine">Everyday Sunshine Birthday</SelectItem>
                <SelectItem value="you-did-it">You Did It!</SelectItem>
                <SelectItem value="cheers-next-chapter">Cheers to the Next Chapter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={selected.length === 0}
            onClick={() => setSent(true)}
            className={cn("cursor-pointer rounded-full", sent && "bg-success hover:bg-success")}
          >
            {sent ? <><CheckIcon size={15} weight="bold" /> Sent to {selected.length}</> : `Send to ${selected.length} employees`}
          </Button>
        </div>
      </GlassPanel>
    </div>
  );
}
