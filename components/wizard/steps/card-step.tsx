"use client";

import * as React from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { CheckCircleIcon, SparkleIcon } from "@phosphor-icons/react";
import { StepShell } from "@/components/wizard/step-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { OccasionIcon } from "@/components/shared/occasion-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { occasions, cultures, type GreetingCard } from "@/lib/mock-data";
import { useWizardStore } from "@/lib/store/wizard-store";
import { generateCultureArtwork } from "@/app/create/actions";
import { cn } from "@/lib/utils";

const SWATCHES = [
  ["#4338CA", "#8F7FF2"],
  ["#B6822F", "#E5B567"],
  ["#0E8FE0", "#4CC9FF"],
  ["#E04B3A", "#FF8A7A"],
  ["#16A34A", "#34D399"],
  ["#8F7FF2", "#0E8FE0"],
  ["#0B1220", "#4338CA"],
  ["#E04B3A", "#B6822F"],
  ["#4338CA", "#E04B3A"],
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CardStep({ cards }: { cards: GreetingCard[] }) {
  const { occasion, culture, cardId, setField } = useWizardStore(
    useShallow((s) => ({
      occasion: s.occasion,
      culture: s.culture,
      cardId: s.cardId,
      setField: s.setField,
    })),
  );

  const [showCustomCulture, setShowCustomCulture] = React.useState(false);
  const [customInput, setCustomInput] = React.useState("");
  const [customLabel, setCustomLabel] = React.useState<string | null>(null);
  const [generating, setGenerating] = React.useState(false);

  const filtered = React.useMemo(() => {
    let list = cards;
    if (occasion) list = list.filter((c) => c.occasion === occasion);
    if (list.length && culture) {
      const cultureMatched = list.filter((c) => c.cultures.includes(culture as never) || c.cultures.includes("universal"));
      if (cultureMatched.length) list = cultureMatched;
    }
    return list.length ? list : cards.slice(0, 8);
  }, [occasion, culture, cards]);

  const handleCustomSubmit = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const match = cultures.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      setField("culture", match.slug);
      setCustomLabel(null);
      setCustomInput("");
      return;
    }

    setField("culture", slugify(trimmed));
    setCustomLabel(trimmed);
  };

  const handleGenerateArt = async () => {
    if (!customLabel) return;
    setGenerating(true);
    const result = await generateCultureArtwork(customLabel);
    setGenerating(false);
    if ("error" in result) {
      toast.info(result.error);
      return;
    }
    toast.success("Custom artwork generated!");
  };

  return (
    <StepShell
      slug="card"
      title="Pick your greeting card"
      description="Filter by occasion or culture if you like — or just browse and pick."
      nextDisabled={!cardId}
    >
      <div className="flex flex-wrap gap-2">
        {occasions.map((o) => {
          const selected = occasion === o.slug;
          return (
            <button
              key={o.slug}
              type="button"
              onClick={() => setField("occasion", selected ? null : o.slug)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                selected ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              <OccasionIcon icon={o.icon} accent={o.accent} size={13} />
              {o.name}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {cultures.map((c, i) => {
          const selected = culture === c.slug;
          const [from, to] = SWATCHES[i % SWATCHES.length];
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => {
                setField("culture", selected ? null : c.slug);
                setCustomLabel(null);
              }}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all",
                selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "opacity-80 hover:opacity-100",
              )}
              style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
            >
              {c.name}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowCustomCulture((v) => !v)}
          className="cursor-pointer rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          + Type your own
        </button>
      </div>

      {showCustomCulture && (
        <GlassPanel className="mt-4 p-5">
          <p className="text-sm font-medium">Any culture, heritage, or family tradition</p>
          <p className="mt-1 text-xs text-muted-foreground">We&apos;ll use it to guide the tone of your card.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
              placeholder="e.g. Filipino, Ethiopian, Irish…"
              className="h-10 flex-1"
            />
            <Button type="button" onClick={handleCustomSubmit} disabled={!customInput.trim()} className="h-10 cursor-pointer rounded-full">
              Use this
            </Button>
          </div>

          {customLabel && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                <CheckCircleIcon size={13} weight="fill" /> {customLabel}
              </span>
              <span className="text-xs text-muted-foreground">We don&apos;t have curated artwork for this one yet.</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={generating}
                onClick={handleGenerateArt}
                className="ml-auto cursor-pointer gap-1.5 rounded-full text-xs"
              >
                <SparkleIcon size={13} weight="fill" className={cn(generating && "animate-spin")} />
                {generating ? "Generating…" : "Generate a custom look with AI"}
              </Button>
            </div>
          )}
        </GlassPanel>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {filtered.map((c) => {
          const selected = cardId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setField("cardId", c.id)}
              className={cn(
                "group relative aspect-[4/5] overflow-hidden rounded-2xl text-left shadow-lg transition-transform duration-300",
                selected ? "ring-2 ring-primary" : "hover:-translate-y-1",
              )}
              style={c.coverImageUrl ? undefined : { background: `linear-gradient(135deg, ${c.paletteFrom}, ${c.paletteTo})` }}
            >
              {c.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
                <img src={c.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
              )}
              {selected && (
                <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckCircleIcon size={14} weight="fill" />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="font-display text-sm leading-snug text-white">{c.title}</p>
              </div>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
