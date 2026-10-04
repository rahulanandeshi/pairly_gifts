"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowCounterClockwiseIcon, CheckIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppearance } from "@/components/appearance-provider";
import { resetUserAppearance, saveUserAppearance } from "@/app/appearance-actions";
import { buildThemeCss, resolveTheme, type UserAppearance } from "@/lib/theme/config";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { FONT_OPTIONS } from "@/lib/theme/fonts";
import { cn } from "@/lib/utils";

const PREVIEW_STYLE_ID = "pairly-appearance-preview";

const ACCENTS = ["#4338ca", "#7c3aed", "#c026d3", "#e11d48", "#ea580c", "#ca8a04", "#15803d", "#0d9488", "#0369a1", "#171717"];

const RADII = [
  { label: "Sharp", value: 0.3 },
  { label: "Soft", value: 0.7 },
  { label: "Default", value: 1 },
  { label: "Round", value: 1.5 },
  { label: "Pillowy", value: 2 },
];

const SITE_DEFAULT = "site-default";

/** Personal look: preset, accent, corner style and fonts — previewed live, saved to a cookie (no account needed). */
export function AppearancePanel({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const { theme, user } = useAppearance();
  const [draft, setDraft] = React.useState<UserAppearance>(user);
  const [pending, startTransition] = React.useTransition();

  const presets = THEME_PRESETS.filter((p) => theme.allowedPresets.includes(p.id));
  const dirty = JSON.stringify(draft) !== JSON.stringify(user);
  const hasAny = Object.values(draft).some((v) => v !== undefined);

  React.useEffect(() => {
    let el = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = PREVIEW_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = buildThemeCss(resolveTheme(theme, draft));
  }, [theme, draft]);
  React.useEffect(() => () => document.getElementById(PREVIEW_STYLE_ID)?.remove(), []);

  const patch = (partial: Partial<UserAppearance>) => setDraft((d) => ({ ...d, ...partial }));

  const save = () =>
    startTransition(async () => {
      const clean = Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== undefined)) as UserAppearance;
      const result = await saveUserAppearance(clean);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Your look is saved.");
      router.refresh();
      onDone?.();
    });

  const reset = () =>
    startTransition(async () => {
      await resetUserAppearance();
      setDraft({});
      toast.success("Back to the site look.");
      router.refresh();
    });

  const fontSelect = (label: string, key: "fontSans" | "fontDisplay", kinds: string[]) => {
    const value = draft[key] ?? SITE_DEFAULT;
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{label}</Label>
        <Select value={value} onValueChange={(v) => patch({ [key]: v && v !== SITE_DEFAULT ? v : undefined })}>
          <SelectTrigger className="h-10 w-full rounded-lg">
            <SelectValue>{(v: string) => (v === SITE_DEFAULT ? "Site default" : (FONT_OPTIONS.find((f) => f.id === v)?.label ?? v))}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={SITE_DEFAULT}>Site default</SelectItem>
            {FONT_OPTIONS.filter((f) => kinds.includes(f.kind)).map((f) => (
              <SelectItem key={f.id} value={f.id}>
                <span style={{ fontFamily: `var(${f.cssVar})` }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Label>Color palette</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => patch({ preset: undefined })}
            className={cn(
              "w-full min-w-0 cursor-pointer rounded-xl border p-2.5 text-left text-sm transition-all",
              !draft.preset ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/60 hover:border-border",
            )}
          >
            Site default
          </button>
          {presets.map((p) => {
            const active = draft.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => patch({ preset: p.id })}
                className={cn(
                  "w-full min-w-0 cursor-pointer rounded-xl border p-2.5 text-left transition-all",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/60 hover:border-border",
                )}
              >
                <div className="flex gap-1">
                  {(["background", "card", "primary", "gold", "electric"] as const).map((k) => (
                    <span key={k} className="size-3.5 rounded-full border border-border/60" style={{ background: p.light[k] }} />
                  ))}
                </div>
                <p className="mt-1.5 flex items-center justify-between text-sm">
                  {p.name} {active && <CheckIcon size={13} weight="bold" className="text-primary" />}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Accent color</Label>
        <div className="mt-2 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => patch({ primary: undefined })}
            className={cn(
              "flex size-9 cursor-pointer items-center justify-center rounded-full border text-[10px] text-muted-foreground",
              !draft.primary ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" : "border-border hover:text-foreground",
            )}
            title="Palette default"
          >
            Auto
          </button>
          {ACCENTS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => patch({ primary: hex })}
              className={cn(
                "size-9 cursor-pointer rounded-full border border-border transition-all",
                draft.primary?.toLowerCase() === hex ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:scale-105",
              )}
              style={{ backgroundColor: hex }}
              aria-label={`Accent ${hex}`}
            />
          ))}
          <label
            className="relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border text-xs text-muted-foreground hover:text-foreground"
            title="Custom color"
          >
            +
            <input
              type="color"
              value={draft.primary ?? "#4338ca"}
              onChange={(e) => patch({ primary: e.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              aria-label="Pick a custom accent color"
            />
          </label>
        </div>
      </div>

      <div>
        <Label>Corners</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[{ label: "Site default", value: undefined as number | undefined }, ...RADII].map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => patch({ radius: r.value })}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-all",
                draft.radius === r.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {fontSelect("Body font", "fontSans", ["sans", "display"])}
        {fontSelect("Headline font", "fontDisplay", ["serif", "display", "sans"])}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <Button type="button" className="cursor-pointer rounded-full" onClick={save} disabled={pending || !dirty}>
          {pending ? "Saving…" : "Save my look"}
        </Button>
        <Button type="button" variant="ghost" className="cursor-pointer rounded-full" onClick={reset} disabled={pending || (!hasAny && !Object.keys(user).length)}>
          <ArrowCounterClockwiseIcon size={15} /> Reset to site look
        </Button>
      </div>
    </div>
  );
}
