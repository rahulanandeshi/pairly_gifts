"use client";

import * as React from "react";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import type { Options as LoreleiOptions } from "@dicebear/lorelei";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SKIN_TONES, HAIR_COLORS } from "@/components/wizard/avatar-options";
import {
  LORELEI_HEAD,
  LORELEI_HAIR,
  LORELEI_EYEBROWS,
  LORELEI_EYES,
  LORELEI_NOSE,
  LORELEI_MOUTH,
  LORELEI_BEARD,
  LORELEI_GLASSES,
  LORELEI_EARRINGS,
  LORELEI_HAIR_ACCESSORIES,
  LORELEI_FIXED_COLORS,
} from "@/components/wizard/lorelei-options";
import { cn } from "@/lib/utils";

interface LoreleiAttrs {
  skinColor: string;
  head: string;
  hair: string;
  hairColor: string;
  eyebrows: string;
  eyes: string;
  nose: string;
  mouth: string;
  beard: string; // "none" or a variant id
  glasses: string; // "none" or a variant id
  earrings: string; // "none" or a variant id
  hairAccessories: string; // "none" or a variant id
}

const DEFAULT_ATTRS: LoreleiAttrs = {
  skinColor: "d08b5b",
  head: "variant01",
  hair: "variant18",
  hairColor: "724133",
  eyebrows: "variant02",
  eyes: "variant12",
  nose: "variant02",
  mouth: "happy09",
  beard: "none",
  glasses: "none",
  earrings: "none",
  hairAccessories: "none",
};

function buildOptions(attrs: LoreleiAttrs) {
  const hasBeard = attrs.beard !== "none";
  const hasGlasses = attrs.glasses !== "none";
  const hasEarrings = attrs.earrings !== "none";
  const hasHairAccessories = attrs.hairAccessories !== "none";

  const options = {
    seed: "pairly",
    skinColor: [attrs.skinColor],
    head: [attrs.head],
    hair: [attrs.hair],
    hairColor: [attrs.hairColor],
    eyebrows: [attrs.eyebrows],
    eyebrowsColor: [LORELEI_FIXED_COLORS.eyebrowsColor],
    eyes: [attrs.eyes],
    eyesColor: [LORELEI_FIXED_COLORS.eyesColor],
    nose: [attrs.nose],
    noseColor: [LORELEI_FIXED_COLORS.noseColor],
    mouth: [attrs.mouth],
    mouthColor: [LORELEI_FIXED_COLORS.mouthColor],
    beard: hasBeard ? [attrs.beard] : undefined,
    beardProbability: hasBeard ? 100 : 0,
    glasses: hasGlasses ? [attrs.glasses] : undefined,
    glassesProbability: hasGlasses ? 100 : 0,
    glassesColor: [LORELEI_FIXED_COLORS.glassesColor],
    earrings: hasEarrings ? [attrs.earrings] : undefined,
    earringsProbability: hasEarrings ? 100 : 0,
    earringsColor: [LORELEI_FIXED_COLORS.earringsColor],
    hairAccessories: hasHairAccessories ? [attrs.hairAccessories] : undefined,
    hairAccessoriesProbability: hasHairAccessories ? 100 : 0,
    hairAccessoriesColor: [LORELEI_FIXED_COLORS.hairAccessoriesColor],
    frecklesProbability: 0,
    backgroundColor: ["transparent"],
  };

  return options as LoreleiOptions;
}

function buildDataUri(attrs: LoreleiAttrs) {
  return createAvatar(lorelei, buildOptions(attrs)).toDataUri();
}

/** A grid of small live-rendered avatar previews, one per option, so picking
 * a lorelei trait (whose ids are just "variant01", "variant02" …, with no
 * semantic names in the schema) shows what it actually looks like instead of
 * a meaningless label. */
function ThumbGrid({
  options,
  selected,
  attrs,
  field,
  onSelect,
  columns = "grid-cols-4 sm:grid-cols-6",
  includeNone = false,
}: {
  options: string[];
  selected: string;
  attrs: LoreleiAttrs;
  field: keyof LoreleiAttrs;
  onSelect: (value: string) => void;
  columns?: string;
  /** Prepends a "None" tile rendered in the same flat grid as the real options
   * (not a nested grid-in-a-cell — that squeezed every option down to a
   * single tiny cell). */
  includeNone?: boolean;
}) {
  const thumbs = React.useMemo(() => {
    const values = includeNone ? ["none", ...options] : options;
    return values.map((value) => ({ value, uri: buildDataUri({ ...attrs, [field]: value }) }));
  }, [options, field, includeNone, attrs.skinColor, attrs.hairColor, attrs.hair, attrs.head]); // eslint-disable-line react-hooks/exhaustive-deps -- only the traits that visibly affect this grid's thumbnails should retrigger it

  return (
    <div className={cn("grid gap-2", columns)}>
      {thumbs.map((t, i) => (
        <button
          key={t.value}
          type="button"
          onClick={() => onSelect(t.value)}
          className={cn(
            "aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted/40 transition-all",
            selected === t.value ? "ring-2 ring-primary" : "hover:-translate-y-0.5 hover:ring-1 hover:ring-border",
          )}
          aria-label={t.value === "none" ? "None" : `Option ${i}`}
          title={t.value === "none" ? "None" : `Option ${i}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- locally generated SVG data URI, not an optimizable asset */}
          <img src={t.uri} alt="" className="h-full w-full object-cover" draggable={false} />
        </button>
      ))}
    </div>
  );
}

interface LoreleiAvatarPickerProps {
  /** Fires on mount and on every change with the rendered avatar's data URI. */
  onChange: (imageUrl: string) => void;
}

export function LoreleiAvatarPicker({ onChange }: LoreleiAvatarPickerProps) {
  const [attrs, setAttrs] = React.useState<LoreleiAttrs>(DEFAULT_ATTRS);
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const set = (partial: Partial<LoreleiAttrs>) => {
    setAttrs((prev) => {
      const next = { ...prev, ...partial };
      onChangeRef.current(buildDataUri(next));
      return next;
    });
  };

  React.useEffect(() => {
    onChangeRef.current(buildDataUri(DEFAULT_ATTRS));
  }, []);

  return (
    <Tabs defaultValue="skin">
      <TabsList className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="skin">Skin</TabsTrigger>
        <TabsTrigger value="hair">Hair</TabsTrigger>
        <TabsTrigger value="face">Face</TabsTrigger>
        <TabsTrigger value="facialHair">Facial Hair</TabsTrigger>
        <TabsTrigger value="accessories">Accessories</TabsTrigger>
      </TabsList>

      <TabsContent value="skin" className="mt-6">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Skin tone</p>
        <div className="flex flex-wrap gap-3">
          {SKIN_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set({ skinColor: t.color.slice(1) })}
              className={cn(
                "size-12 cursor-pointer rounded-full ring-offset-2 ring-offset-background transition-all",
                attrs.skinColor === t.color.slice(1) ? "ring-2 ring-primary scale-110" : "hover:scale-105",
              )}
              style={{ backgroundColor: t.color }}
              aria-label={t.label}
              title={t.label}
            />
          ))}
        </div>
        <p className="mb-3 mt-6 text-xs font-medium text-muted-foreground">Face shape</p>
        <ThumbGrid options={LORELEI_HEAD} selected={attrs.head} attrs={attrs} field="head" onSelect={(v) => set({ head: v })} />
      </TabsContent>

      <TabsContent value="hair" className="mt-6">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Style</p>
        <ThumbGrid options={LORELEI_HAIR} selected={attrs.hair} attrs={attrs} field="hair" onSelect={(v) => set({ hair: v })} />
        <p className="mb-3 mt-6 text-xs font-medium text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-3">
          {HAIR_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set({ hairColor: c.color.slice(1) })}
              className={cn(
                "size-10 cursor-pointer rounded-full ring-offset-2 ring-offset-background transition-all",
                attrs.hairColor === c.color.slice(1) ? "ring-2 ring-primary scale-110" : "hover:scale-105",
              )}
              style={{ backgroundColor: c.color }}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
        <p className="mb-3 mt-6 text-xs font-medium text-muted-foreground">Accessory</p>
        <ThumbGrid
          includeNone
          columns="grid-cols-3 sm:grid-cols-4"
          options={LORELEI_HAIR_ACCESSORIES}
          selected={attrs.hairAccessories}
          attrs={attrs}
          field="hairAccessories"
          onSelect={(v) => set({ hairAccessories: v })}
        />
      </TabsContent>

      <TabsContent value="face" className="mt-6 flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Eyes</p>
          <ThumbGrid options={LORELEI_EYES} selected={attrs.eyes} attrs={attrs} field="eyes" onSelect={(v) => set({ eyes: v })} />
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Eyebrows</p>
          <ThumbGrid options={LORELEI_EYEBROWS} selected={attrs.eyebrows} attrs={attrs} field="eyebrows" onSelect={(v) => set({ eyebrows: v })} />
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Nose</p>
          <ThumbGrid options={LORELEI_NOSE} selected={attrs.nose} attrs={attrs} field="nose" onSelect={(v) => set({ nose: v })} />
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Mouth</p>
          <ThumbGrid options={LORELEI_MOUTH} selected={attrs.mouth} attrs={attrs} field="mouth" onSelect={(v) => set({ mouth: v })} />
        </div>
      </TabsContent>

      <TabsContent value="facialHair" className="mt-6">
        <ThumbGrid
          includeNone
          columns="grid-cols-3 sm:grid-cols-4"
          options={LORELEI_BEARD}
          selected={attrs.beard}
          attrs={attrs}
          field="beard"
          onSelect={(v) => set({ beard: v })}
        />
      </TabsContent>

      <TabsContent value="accessories" className="mt-6 flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Glasses</p>
          <ThumbGrid
            includeNone
            columns="grid-cols-3 sm:grid-cols-4"
            options={LORELEI_GLASSES}
            selected={attrs.glasses}
            attrs={attrs}
            field="glasses"
            onSelect={(v) => set({ glasses: v })}
          />
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Earrings</p>
          <ThumbGrid
            includeNone
            columns="grid-cols-3 sm:grid-cols-4"
            options={LORELEI_EARRINGS}
            selected={attrs.earrings}
            attrs={attrs}
            field="earrings"
            onSelect={(v) => set({ earrings: v })}
          />
        </div>
      </TabsContent>
    </Tabs>
  );
}
