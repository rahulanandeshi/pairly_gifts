"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowCounterClockwiseIcon, CheckIcon, FloppyDiskIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveThemeConfig } from "@/app/admin/actions";
import { DEFAULT_THEME_CONFIG, buildThemeCss, resolveTheme, type ThemeConfig } from "@/lib/theme/config";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { TOKENS, TOKEN_GROUPS, type ThemeMode } from "@/lib/theme/tokens";
import { FONT_OPTIONS } from "@/lib/theme/fonts";
import { isValidColor, pickKeepingAlpha, toHex6 } from "@/lib/theme/color";
import { cn } from "@/lib/utils";

const PREVIEW_STYLE_ID = "pairly-theme-preview";

function ColorField({
  label,
  value,
  overridden,
  onChange,
  onReset,
}: {
  label: string;
  value: string;
  overridden: boolean;
  onChange: (value: string) => void;
  onReset: () => void;
}) {
  // While typing, show the raw text; otherwise mirror the token's current value.
  const [typing, setTyping] = React.useState<string | null>(null);
  const text = typing ?? value;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2">
      <label className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border" style={{ background: value }}>
        <input
          type="color"
          value={toHex6(value)}
          onChange={(e) => onChange(pickKeepingAlpha(value, e.target.value))}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{label}</p>
        <input
          value={text}
          onChange={(e) => {
            setTyping(e.target.value);
            if (isValidColor(e.target.value)) onChange(e.target.value.trim());
          }}
          onBlur={() => setTyping(null)}
          spellCheck={false}
          className="w-full bg-transparent font-mono text-[11px] text-muted-foreground outline-none focus:text-foreground"
          aria-label={`${label} value`}
        />
      </div>
      {overridden && (
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          title="Reset to preset"
          aria-label={`Reset ${label}`}
        >
          <ArrowCounterClockwiseIcon size={14} />
        </button>
      )}
    </div>
  );
}

function SliderRow({
  label,
  hint,
  value,
  min,
  max,
  step,
  format,
  onChange,
  onReset,
  isDefault,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  onReset?: () => void;
  isDefault?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <Label>{label}</Label>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{format(value)}</span>
          {onReset && !isDefault && (
            <button type="button" onClick={onReset} className="cursor-pointer text-xs text-primary hover:underline">
              Reset
            </button>
          )}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
      />
    </div>
  );
}

function FontSelect({ label, value, onChange, kinds }: { label: string; value: string; onChange: (v: string) => void; kinds: string[] }) {
  const options = FONT_OPTIONS.filter((f) => kinds.includes(f.kind) || f.id === value);
  const current = FONT_OPTIONS.find((f) => f.id === value);
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-11 w-full rounded-lg">
          <SelectValue>{(v: string) => FONT_OPTIONS.find((f) => f.id === v)?.label ?? v}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span style={{ fontFamily: `var(${f.cssVar})` }}>{f.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {current && (
        <p className="text-balance text-2xl leading-tight" style={{ fontFamily: `var(${current.cssVar})` }}>
          Every celebration deserves to feel personal.
        </p>
      )}
    </div>
  );
}

export function AppearanceEditor({ initial }: { initial: ThemeConfig }) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initial);
  const [config, setConfig] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const [editMode, setEditMode] = React.useState<ThemeMode>("light");

  const dirty = JSON.stringify(config) !== JSON.stringify(saved);
  const resolved = React.useMemo(() => resolveTheme(config), [config]);

  // Live preview: an extra <style> appended after the server-rendered theme, so the whole admin UI
  // (and every open tab of the site after saving) reflects edits instantly. Removed on unmount.
  React.useEffect(() => {
    let el = document.getElementById(PREVIEW_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = PREVIEW_STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = buildThemeCss(resolved);
  }, [resolved]);
  React.useEffect(() => () => document.getElementById(PREVIEW_STYLE_ID)?.remove(), []);

  // Warn before losing unsaved edits.
  React.useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const patch = (partial: Partial<ThemeConfig>) => setConfig((c) => ({ ...c, ...partial }));

  const setOverride = (mode: ThemeMode, key: string, value: string) =>
    setConfig((c) => ({ ...c, [mode]: { ...c[mode], [key]: value } }));
  const clearOverride = (mode: ThemeMode, key: string) =>
    setConfig((c) => {
      const next = { ...c[mode] };
      delete next[key];
      return { ...c, [mode]: next };
    });

  const choosePreset = (id: string) => setConfig((c) => ({ ...c, preset: id, light: {}, dark: {} }));

  const save = () =>
    startTransition(async () => {
      const result = await saveThemeConfig(config);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSaved(config);
      toast.success("Theme saved for everyone.");
      router.refresh();
    });

  const overrides = config[editMode];
  const tokens = editMode === "light" ? resolved.light : resolved.dark;

  return (
    <div className="pb-28">
      <GlassPanel className="p-6">
        <h2 className="font-medium">Preset</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Start from a palette, then fine-tune anything below. Picking a preset clears your color tweaks.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {THEME_PRESETS.map((p) => {
            const active = config.preset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePreset(p.id)}
                className={cn(
                  "w-full min-w-0 cursor-pointer rounded-2xl border p-3 text-left transition-all",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/60 hover:-translate-y-0.5 hover:border-border",
                )}
              >
                <div className="flex overflow-hidden rounded-xl border border-border/60">
                  {(["light", "dark"] as const).map((m) => (
                    <div key={m} className="flex flex-1 flex-col gap-1.5 p-2" style={{ background: p[m].background }}>
                      <div className="h-4 rounded-md" style={{ background: p[m].card }} />
                      <div className="flex gap-1">
                        {(["primary", "gold", "electric", "coral"] as const).map((k) => (
                          <span key={k} className="size-3 rounded-full" style={{ background: p[m][k] }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{p.name}</p>
                  {active && <CheckIcon size={14} weight="bold" className="text-primary" />}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Colors</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Change the core colors and the rest follow. Open “Fine-tune” to override any individual token.
            </p>
          </div>
          <Tabs value={editMode} onValueChange={(v) => setEditMode(v as ThemeMode)}>
            <TabsList>
              <TabsTrigger value="light">Light mode</TabsTrigger>
              <TabsTrigger value="dark">Dark mode</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Toggle the theme switch in the top bar to see {editMode} mode live while you edit.
        </p>

        <div className="mt-5 flex flex-col gap-6">
          {TOKEN_GROUPS.map((group) => {
            const items = TOKENS.filter((t) => t.group === group);
            const core = items.filter((t) => t.base);
            const advanced = items.filter((t) => !t.base);
            const renderField = (t: (typeof TOKENS)[number]) => (
              <ColorField
                key={t.key}
                label={t.label}
                value={tokens[t.key]}
                overridden={t.key in overrides}
                onChange={(v) => setOverride(editMode, t.key, v)}
                onReset={() => clearOverride(editMode, t.key)}
              />
            );
            return (
              <div key={group}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group}</p>
                {core.length > 0 && <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{core.map(renderField)}</div>}
                {advanced.length > 0 && (
                  <details className="group mt-2">
                    <summary className="cursor-pointer text-xs text-primary hover:underline">
                      Fine-tune {group.toLowerCase()} ({advanced.length})
                    </summary>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{advanced.map(renderField)}</div>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </GlassPanel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassPanel className="flex flex-col gap-6 p-6">
          <div>
            <h2 className="font-medium">Shape & glass</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Corner roundness and the frosted-glass panels used across the app.</p>
          </div>
          <SliderRow
            label="Corner radius"
            hint="0 is sharp, 1 is the default, higher is pillowy."
            value={config.radius}
            min={0}
            max={2}
            step={0.05}
            format={(v) => `${v.toFixed(2)}rem`}
            onChange={(v) => patch({ radius: v })}
            onReset={() => patch({ radius: 1 })}
            isDefault={config.radius === 1}
          />
          <SliderRow
            label="Glass blur"
            hint="How strongly panels blur what's behind them."
            value={config.glassBlur ?? 22}
            min={0}
            max={60}
            step={1}
            format={(v) => (config.glassBlur === null ? "preset" : `${v}px`)}
            onChange={(v) => patch({ glassBlur: v })}
            onReset={() => patch({ glassBlur: null })}
            isDefault={config.glassBlur === null}
          />
          <SliderRow
            label="Glass opacity"
            hint="Fill strength of glass panels — lower is clearer."
            value={config.glassOpacity ?? 0.3}
            min={0}
            max={1}
            step={0.01}
            format={(v) => (config.glassOpacity === null ? "preset" : `${Math.round(v * 100)}%`)}
            onChange={(v) => patch({ glassOpacity: v })}
            onReset={() => patch({ glassOpacity: null })}
            isDefault={config.glassOpacity === null}
          />
          <div className="flex flex-col gap-1.5">
            <Label>Default mode</Label>
            <Select value={config.defaultMode} onValueChange={(v) => v && patch({ defaultMode: v as ThemeConfig["defaultMode"] })}>
              <SelectTrigger className="h-11 w-full rounded-lg">
                <SelectValue>{(v: string) => ({ light: "Light", dark: "Dark", system: "Match the device" })[v] ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="system">Match the device</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">What first-time visitors see. Anyone can still switch with the theme toggle.</p>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-6 p-6">
          <div>
            <h2 className="font-medium">Typography</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Body text and the display face used for headlines.</p>
          </div>
          <FontSelect label="Body font" value={config.fontSans} onChange={(v) => patch({ fontSans: v })} kinds={["sans", "display"]} />
          <FontSelect label="Headline font" value={config.fontDisplay} onChange={(v) => patch({ fontDisplay: v })} kinds={["serif", "display", "sans"]} />
        </GlassPanel>
      </div>

      <GlassPanel className="mt-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-medium">Let visitors personalize</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Adds Settings → Appearance where anyone can pick a preset, an accent color, corner style and fonts for themselves. Your theme stays the default.
            </p>
          </div>
          <Switch
            checked={config.allowUserTheme}
            onCheckedChange={(v) => patch({ allowUserTheme: v })}
            aria-label="Allow visitors to personalize the theme"
            className="mt-1 cursor-pointer"
          />
        </div>
        {config.allowUserTheme && (
          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Presets visitors can choose</p>
            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((p) => {
                const on = config.allowedPresets.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      patch({
                        allowedPresets: on ? config.allowedPresets.filter((id) => id !== p.id) : [...config.allowedPresets, p.id],
                      })
                    }
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all",
                      on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={on}
                  >
                    <span className="size-3 rounded-full" style={{ background: p.light.primary }} />
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Custom CSS</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Advanced: extra CSS appended after the theme. Use the CSS variables (<code className="font-mono text-xs">var(--primary)</code>,{" "}
          <code className="font-mono text-xs">var(--radius)</code> …) to stay consistent.
        </p>
        <Textarea
          value={config.customCss}
          onChange={(e) => patch({ customCss: e.target.value })}
          rows={6}
          spellCheck={false}
          placeholder={".glass-panel { box-shadow: 0 10px 40px -20px var(--primary); }"}
          className="mt-3 font-mono text-xs"
        />
      </GlassPanel>

      <GlassPanel className="mt-6 p-6">
        <h2 className="font-medium">Live sample</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Real components using your current theme.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button className="cursor-pointer rounded-full">Primary action</Button>
          <Button variant="secondary" className="cursor-pointer rounded-full">Secondary</Button>
          <Button variant="outline" className="cursor-pointer rounded-full">Outline</Button>
          <Button variant="destructive" className="cursor-pointer rounded-full">Delete</Button>
          <Input placeholder="A text field" className="h-10 w-48" readOnly />
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold">Gold</span>
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-medium text-success">Success</span>
          <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-medium text-coral">Coral</span>
          <span className="rounded-full bg-electric/15 px-3 py-1 text-xs font-medium text-electric">Electric</span>
        </div>
        <h3 className="mt-5 font-display text-3xl">A headline in your display font</h3>
        <p className="mt-1 text-muted-foreground">Body copy set in your body font, with muted text for supporting detail.</p>
      </GlassPanel>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {dirty ? "You have unsaved changes — previewing live, not yet visible to visitors." : "All changes saved."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer rounded-full"
              onClick={() => setConfig(DEFAULT_THEME_CONFIG)}
              disabled={pending || JSON.stringify(config) === JSON.stringify(DEFAULT_THEME_CONFIG)}
            >
              <ArrowCounterClockwiseIcon size={15} /> Reset to default
            </Button>
            <Button type="button" variant="outline" className="cursor-pointer rounded-full" onClick={() => setConfig(saved)} disabled={pending || !dirty}>
              Discard
            </Button>
            <Button type="button" className="cursor-pointer rounded-full" onClick={save} disabled={pending || !dirty}>
              <FloppyDiskIcon size={15} weight="bold" /> {pending ? "Saving…" : "Save theme"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
