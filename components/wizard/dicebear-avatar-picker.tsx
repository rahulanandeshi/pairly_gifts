"use client";

import * as React from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import type { Options as AvataaarsOptions } from "@dicebear/avataaars";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  OUTFITS,
  ACCESSORIES,
  FACIAL_HAIR,
  EYES,
  EYEBROWS,
  MOUTHS,
} from "@/components/wizard/avatar-options";
import { cn } from "@/lib/utils";

interface DicebearAttrs {
  skinColor: string;
  top: string;
  hairColor: string;
  facialHair: string;
  facialHairColor: string;
  clothing: string;
  clothesColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  accessories: string;
  accessoriesColor: string;
}

const DEFAULT_ATTRS: DicebearAttrs = {
  skinColor: "d08b5b",
  top: "shortFlat",
  hairColor: "2c1b18",
  facialHair: "none",
  facialHairColor: "2c1b18",
  clothing: "shirtCrewNeck",
  clothesColor: "65c9ff",
  eyes: "default",
  eyebrows: "default",
  mouth: "smile",
  accessories: "none",
  accessoriesColor: "262e33",
};

function buildDataUri(attrs: DicebearAttrs) {
  const hasFacialHair = attrs.facialHair !== "none";
  const hasAccessories = attrs.accessories !== "none";
  const hasTop = attrs.top !== "bald";

  const options: AvataaarsOptions = {
    seed: "pairly",
    skinColor: [attrs.skinColor],
    top: hasTop ? [attrs.top] : undefined,
    topProbability: hasTop ? 100 : 0,
    hairColor: [attrs.hairColor],
    facialHair: hasFacialHair ? [attrs.facialHair] : undefined,
    facialHairProbability: hasFacialHair ? 100 : 0,
    facialHairColor: [attrs.facialHairColor],
    clothing: [attrs.clothing],
    clothesColor: [attrs.clothesColor],
    eyes: [attrs.eyes],
    eyebrows: [attrs.eyebrows],
    mouth: [attrs.mouth],
    accessories: hasAccessories ? [attrs.accessories] : undefined,
    accessoriesProbability: hasAccessories ? 100 : 0,
    accessoriesColor: [attrs.accessoriesColor],
    backgroundColor: ["transparent"],
  } as AvataaarsOptions;

  return createAvatar(avataaars, options).toDataUri();
}

interface DicebearAvatarPickerProps {
  /** Fires on mount and on every change with the rendered avatar's data URI. */
  onChange: (imageUrl: string) => void;
}

export function DicebearAvatarPicker({ onChange }: DicebearAvatarPickerProps) {
  const [attrs, setAttrs] = React.useState<DicebearAttrs>(DEFAULT_ATTRS);
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const set = (partial: Partial<DicebearAttrs>) => {
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
        <TabsTrigger value="facialHair">Facial Hair</TabsTrigger>
        <TabsTrigger value="face">Face</TabsTrigger>
        <TabsTrigger value="outfit">Outfit</TabsTrigger>
        <TabsTrigger value="accessories">Accessories</TabsTrigger>
      </TabsList>

      <TabsContent value="skin" className="mt-6">
        <div className="flex flex-wrap gap-3">
          {SKIN_TONES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => set({ skinColor: t.id })}
              className={cn(
                "size-12 cursor-pointer rounded-full ring-offset-2 ring-offset-background transition-all",
                attrs.skinColor === t.id ? "ring-2 ring-primary scale-110" : "hover:scale-105",
              )}
              style={{ backgroundColor: t.color }}
              aria-label={t.label}
              title={t.label}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="hair" className="mt-6">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Style</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {HAIR_STYLES.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => set({ top: h.id })}
              className={cn(
                "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                attrs.top === h.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
              )}
            >
              {h.label}
            </button>
          ))}
        </div>
        <p className="mb-3 mt-6 text-xs font-medium text-muted-foreground">Color</p>
        <div className="flex flex-wrap gap-3">
          {HAIR_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => set({ hairColor: c.id })}
              className={cn(
                "size-10 cursor-pointer rounded-full ring-offset-2 ring-offset-background transition-all",
                attrs.hairColor === c.id ? "ring-2 ring-primary scale-110" : "hover:scale-105",
              )}
              style={{ backgroundColor: c.color }}
              aria-label={c.label}
              title={c.label}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="facialHair" className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FACIAL_HAIR.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => set({ facialHair: f.id })}
              className={cn(
                "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                attrs.facialHair === f.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="face" className="mt-6 flex flex-col gap-6">
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Eyes</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {EYES.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => set({ eyes: e.id })}
                className={cn(
                  "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                  attrs.eyes === e.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Eyebrows</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {EYEBROWS.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => set({ eyebrows: e.id })}
                className={cn(
                  "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                  attrs.eyebrows === e.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
                )}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">Mouth</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {MOUTHS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => set({ mouth: m.id })}
                className={cn(
                  "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                  attrs.mouth === m.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="outfit" className="mt-6">
        <div className="grid grid-cols-2 gap-3">
          {OUTFITS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => set({ clothing: o.id, clothesColor: o.color })}
              className={cn(
                "glass-panel flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-all",
                attrs.clothing === o.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
              )}
            >
              <span className="size-6 shrink-0 rounded-full border border-border" style={{ backgroundColor: o.color }} />
              <span className="text-sm">{o.label}</span>
            </button>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="accessories" className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACCESSORIES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => set({ accessories: a.id })}
              className={cn(
                "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                attrs.accessories === a.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}
