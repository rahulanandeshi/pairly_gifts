"use client";

import * as React from "react";
import { ArrowsClockwiseIcon, ArrowCounterClockwiseIcon } from "@phosphor-icons/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAvatarSettings } from "@/components/avatar-settings-provider";
import { AVATAR_STYLES, type AvatarStyleGroup } from "@/lib/avatar/styles";
import { renderAvatar as render, useStyleModule, type StyleModule } from "@/lib/avatar/dicebear-client";
import {
  BACKGROUND_PALETTE,
  buildAvatarOptions,
  describeStyle,
  humanize,
  initialBuilderState,
  randomSeed,
  type BuilderState,
  type StyleDef,
  type TraitDef,
} from "@/lib/avatar/schema";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// A schema-driven avatar builder for every DiceBear style. The trait and color
// pickers are generated from each style's own JSON schema, so any style an
// admin enables (Admin → Avatar Styles) gets a full picker with live
// thumbnails — no per-style code. Styles are lazy-loaded one at a time.
// ---------------------------------------------------------------------------

const withoutKey = (traits: Record<string, string>, key: string) => {
  const copy = { ...traits };
  delete copy[key];
  return copy;
};

function optionLabel(id: string, index: number) {
  return /^(variant|option)?\d+$/i.test(id) || /^variant\d+$/i.test(id) ? `Option ${index + 1}` : humanize(id);
}

const tileClass = (active: boolean) =>
  cn(
    "aspect-square cursor-pointer overflow-hidden rounded-xl bg-muted/40 transition-all",
    active ? "ring-2 ring-primary" : "hover:-translate-y-0.5 hover:ring-1 hover:ring-border",
  );

function TraitGrid({
  styleModule,
  def,
  trait,
  state,
  onPick,
}: {
  styleModule: StyleModule;
  def: StyleDef;
  trait: TraitDef;
  state: BuilderState;
  onPick: (value: string) => void;
}) {
  // Each thumbnail previews the current build with just this trait swapped, so it only needs
  // recomputing when something *other* than this trait changes.
  const signature = JSON.stringify([state.style, state.seed, state.background, state.colors, withoutKey(state.traits, trait.key)]);
  const thumbs = React.useMemo(() => {
    const values = trait.optional ? ["none", ...trait.options] : trait.options;
    return values.map((value) => ({
      value,
      uri: render(styleModule, buildAvatarOptions(def, { ...state, traits: { ...state.traits, [trait.key]: value } })),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `signature` captures exactly the inputs that matter
  }, [styleModule, def, trait, signature]);

  const roomy = thumbs.length <= 8;
  return (
    <div className={cn("grid gap-2", roomy ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-4 sm:grid-cols-6")}>
      {thumbs.map((t, i) => {
        const label = t.value === "none" ? "None" : optionLabel(t.value, trait.optional ? i - 1 : i);
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onPick(t.value)}
            className={tileClass(state.traits[trait.key] === t.value)}
            aria-label={`${trait.label}: ${label}`}
            title={label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- locally generated SVG data URI, not an optimizable asset */}
            <img src={t.uri} alt="" className="h-full w-full object-cover" draggable={false} />
          </button>
        );
      })}
    </div>
  );
}

function Swatches({
  palette,
  value,
  onPick,
  size = "size-10",
}: {
  palette: string[];
  value: string | undefined;
  onPick: (hex: string) => void;
  size?: string;
}) {
  const current = value?.toLowerCase();
  const custom = current && !palette.includes(current) && current !== "transparent";
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {palette.map((hex) => (
        <button
          key={hex}
          type="button"
          onClick={() => onPick(hex)}
          className={cn(
            size,
            "cursor-pointer rounded-full border border-border ring-offset-2 ring-offset-background transition-all",
            current === hex ? "scale-110 ring-2 ring-primary" : "hover:scale-105",
            hex === "transparent" && "bg-[conic-gradient(#ccc_25%,#fff_0_50%,#ccc_0_75%,#fff_0)] bg-[length:10px_10px]",
          )}
          style={hex === "transparent" ? undefined : { backgroundColor: `#${hex}` }}
          aria-label={hex === "transparent" ? "Transparent" : `#${hex}`}
          title={hex === "transparent" ? "Transparent" : `#${hex}`}
        />
      ))}
      <label
        className={cn(
          size,
          "relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border text-xs text-muted-foreground hover:text-foreground",
          custom && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        )}
        style={custom ? { backgroundColor: `#${current}` } : undefined}
        title="Custom color"
      >
        {custom ? null : "+"}
        <input
          type="color"
          value={custom ? `#${current}` : "#888888"}
          onChange={(e) => onPick(e.target.value.slice(1))}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label="Pick a custom color"
        />
      </label>
    </div>
  );
}

function StyleTile({ id, label, seed, active, onPick }: { id: string; label: string; seed: string; active: boolean; onPick: () => void }) {
  const styleModule = useStyleModule(id);
  const uri = React.useMemo(() => (styleModule ? render(styleModule, { seed, backgroundColor: ["transparent"] }) : null), [styleModule, seed]);
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-1.5 text-center transition-all",
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/60 hover:-translate-y-0.5 hover:border-border",
      )}
      aria-pressed={active}
    >
      <span className="aspect-square w-full overflow-hidden rounded-lg bg-muted/40">
        {uri && (
          // eslint-disable-next-line @next/next/no-img-element -- locally generated SVG data URI
          <img src={uri} alt="" className="h-full w-full object-cover" draggable={false} />
        )}
      </span>
      <span className="w-full truncate text-[11px] leading-tight">{label}</span>
    </button>
  );
}

interface AvatarStyleBuilderProps {
  /** Fires whenever the rendered avatar changes (and once when the first style finishes loading). */
  onChange: (imageUrl: string) => void;
}

export function AvatarStyleBuilder({ onChange }: AvatarStyleBuilderProps) {
  const settings = useAvatarSettings();
  const [state, setState] = React.useState<BuilderState>(() => initialBuilderState(settings.defaultStyle));
  const [tab, setTab] = React.useState<string>("random");
  const styleModule = useStyleModule(state.style);
  const def = React.useMemo(() => (styleModule ? describeStyle(styleModule.schema) : null), [styleModule]);

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const dataUri = React.useMemo(
    () => (styleModule && def ? render(styleModule, buildAvatarOptions(def, state)) : null),
    [styleModule, def, state],
  );
  React.useEffect(() => {
    if (dataUri) onChangeRef.current(dataUri);
  }, [dataUri]);

  const patch = (partial: Partial<BuilderState>) => setState((s) => ({ ...s, ...partial }));
  const pickTrait = (key: string, value: string) => setState((s) => ({ ...s, traits: { ...s.traits, [key]: value } }));
  const pickColor = (key: string, hex: string) => setState((s) => ({ ...s, colors: { ...s.colors, [key]: hex } }));

  const chooseStyle = (id: string) => {
    if (id === state.style) return;
    // Trait keys differ per style, so picks don't carry over — the seed and background do.
    setState((s) => ({ ...s, style: id, traits: {}, colors: {}, background: settings.allowBackground ? s.background : "transparent" }));
    setTab("random");
  };

  const enabled = AVATAR_STYLES.filter((s) => settings.enabledStyles.includes(s.id));
  const groups = (["People", "Faces", "Robots & abstract"] as AvatarStyleGroup[])
    .map((group) => ({ group, styles: enabled.filter((s) => s.group === group) }))
    .filter((g) => g.styles.length > 0);

  const traitTabs = def?.traits ?? [];
  const validTabs = new Set([...traitTabs.map((t) => t.key), "colors", "background", "random"]);
  const activeTab = validTabs.has(tab) ? tab : "random";

  return (
    <div className="flex flex-col gap-5">
      {settings.allowStyleChoice && enabled.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Style</p>
          <div className="max-h-56 overflow-y-auto rounded-2xl border border-border/60 p-2">
            {groups.map(({ group, styles }) => (
              <div key={group} className="mb-2 last:mb-0">
                {groups.length > 1 && <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80">{group}</p>}
                <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                  {styles.map((s) => (
                    <StyleTile key={s.id} id={s.id} label={s.label} seed={state.seed} active={state.style === s.id} onPick={() => chooseStyle(s.id)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!styleModule || !def ? (
        <p className="py-6 text-center text-sm text-muted-foreground">Loading style…</p>
      ) : (
        <Tabs value={activeTab} onValueChange={(v) => setTab(String(v))}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="random">Surprise</TabsTrigger>
            {traitTabs.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
            {def.colors.length > 0 && <TabsTrigger value="colors">Colors</TabsTrigger>}
            {settings.allowBackground && <TabsTrigger value="background">Background</TabsTrigger>}
          </TabsList>

          <TabsContent value="random" className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" className="cursor-pointer gap-2 rounded-full" onClick={() => patch({ seed: randomSeed(), traits: {}, colors: {} })}>
                <ArrowsClockwiseIcon size={15} weight="bold" /> Surprise me
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer gap-2 rounded-full"
                onClick={() => patch({ traits: {}, colors: {} })}
                disabled={Object.keys(state.traits).length + Object.keys(state.colors).length === 0}
              >
                <ArrowCounterClockwiseIcon size={15} /> Clear my picks
              </Button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="avatar-seed" className="text-xs font-medium text-muted-foreground">
                Or type anything — a name, a word — and the avatar is generated from it
              </label>
              <Input id="avatar-seed" value={state.seed} onChange={(e) => patch({ seed: e.target.value, traits: {}, colors: {} })} className="h-11" />
            </div>
            {traitTabs.length > 0 && (
              <p className="text-xs text-muted-foreground">Then fine-tune anything with the tabs above — every pick sticks until you clear it.</p>
            )}
          </TabsContent>

          {traitTabs.map((trait) => (
            <TabsContent key={trait.key} value={trait.key} className="mt-6">
              <TraitGrid styleModule={styleModule} def={def} trait={trait} state={state} onPick={(v) => pickTrait(trait.key, v)} />
            </TabsContent>
          ))}

          {def.colors.length > 0 && (
            <TabsContent value="colors" className="mt-6 flex flex-col gap-6">
              {def.colors.map((c) => (
                <div key={c.key}>
                  <p className="mb-2.5 text-xs font-medium text-muted-foreground">{c.label}</p>
                  <Swatches palette={c.palette} value={state.colors[c.key]} onPick={(hex) => pickColor(c.key, hex)} />
                </div>
              ))}
            </TabsContent>
          )}

          {settings.allowBackground && (
            <TabsContent value="background" className="mt-6">
              <p className="mb-2.5 text-xs font-medium text-muted-foreground">Behind the avatar</p>
              <Swatches palette={BACKGROUND_PALETTE} value={state.background} onPick={(hex) => patch({ background: hex })} />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
