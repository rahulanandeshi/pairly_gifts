"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleCardFeatured } from "@/app/admin/actions";

interface FeaturedCard {
  id: string;
  title: string;
  paletteFrom: string;
  paletteTo: string;
}

export function FeaturedCardsGrid({ cards }: { cards: FeaturedCard[] }) {
  const [rows, setRows] = React.useState(cards);

  const handleToggle = async (id: string, featured: boolean) => {
    setRows((prev) => (featured ? prev : prev.filter((c) => c.id !== id)));
    const result = await toggleCardFeatured(id, featured);
    if ("error" in result) {
      toast.error(result.error);
      setRows(cards);
    }
  };

  if (rows.length === 0) {
    return <p className="mt-4 text-sm text-muted-foreground">No featured cards right now.</p>;
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map((c) => (
        <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
          <span className="size-9 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }} />
          <span className="min-w-0 flex-1 truncate text-sm">{c.title}</span>
          <Switch defaultChecked onCheckedChange={(checked) => handleToggle(c.id, checked)} />
        </div>
      ))}
    </div>
  );
}
