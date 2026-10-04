"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateCardPrice } from "@/app/creator/actions";

export function CardPriceRow({ cardId, title, paletteFrom, paletteTo, initialPrice }: {
  cardId: string;
  title: string;
  paletteFrom: string;
  paletteTo: string;
  initialPrice: number;
}) {
  const router = useRouter();
  const [price, setPrice] = React.useState(initialPrice.toFixed(2));
  const [saving, setSaving] = React.useState(false);

  const handleSave = async () => {
    const value = Number(price);
    if (Number.isNaN(value) || value < 0) {
      toast.error("Enter a valid price.");
      return;
    }
    setSaving(true);
    const result = await updateCardPrice(cardId, value);
    setSaving(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Price updated.");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-4 p-4 sm:p-5">
      <span className="size-10 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${paletteFrom}, ${paletteTo})` }} />
      <p className="min-w-0 flex-1 truncate text-sm">{title}</p>
      <Input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={handleSave}
        disabled={saving}
        inputMode="decimal"
        className="h-9 w-24 rounded-full text-right"
      />
      <Button size="sm" variant="ghost" disabled={saving} onClick={handleSave} className="cursor-pointer rounded-full text-xs">
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
