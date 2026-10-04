"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, FloppyDiskIcon, StarIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { saveAvatarSettings } from "@/app/admin/actions";
import { AVATAR_ANIMATIONS, AVATAR_STYLES, DEFAULT_AVATAR_SETTINGS, type AvatarSettings, type AvatarStyleGroup } from "@/lib/avatar/styles";
import { renderAvatar, useStyleModule } from "@/lib/avatar/dicebear-client";
import { cn } from "@/lib/utils";

const PREVIEW_SEEDS = ["Amara", "Diego", "Priya"];

function StylePreview({ id }: { id: string }) {
  const styleModule = useStyleModule(id);
  const uris = React.useMemo(
    () => (styleModule ? PREVIEW_SEEDS.map((seed) => renderAvatar(styleModule, { seed, backgroundColor: ["transparent"] })) : []),
    [styleModule],
  );
  return (
    <div className="flex h-14 items-center justify-center -space-x-3">
      {uris.length === 0
        ? PREVIEW_SEEDS.map((s) => <span key={s} className="size-12 animate-pulse rounded-full bg-muted/60" />)
        : uris.map((uri, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- locally generated SVG data URI
            <img key={PREVIEW_SEEDS[i]} src={uri} alt="" className="size-12 rounded-full border-2 border-card bg-muted/40 object-cover" draggable={false} />
          ))}
    </div>
  );
}

export function AvatarSettingsEditor({ initial }: { initial: AvatarSettings }) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initial);
  const [settings, setSettings] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  const patch = (partial: Partial<AvatarSettings>) => setSettings((s) => ({ ...s, ...partial }));

  const toggleStyle = (id: string) =>
    setSettings((s) => {
      const on = s.enabledStyles.includes(id);
      if (on && s.enabledStyles.length === 1) {
        toast.error("Keep at least one style enabled.");
        return s;
      }
      const enabledStyles = on ? s.enabledStyles.filter((x) => x !== id) : [...s.enabledStyles, id];
      return { ...s, enabledStyles, defaultStyle: enabledStyles.includes(s.defaultStyle) ? s.defaultStyle : enabledStyles[0] };
    });

  const toggleAnimation = (id: string) =>
    setSettings((s) => {
      const on = s.enabledAnimations.includes(id);
      if (on && s.enabledAnimations.length === 1) {
        toast.error("Keep at least one animation enabled.");
        return s;
      }
      const enabledAnimations = on ? s.enabledAnimations.filter((x) => x !== id) : [...s.enabledAnimations, id];
      return {
        ...s,
        enabledAnimations,
        defaultAnimation: enabledAnimations.includes(s.defaultAnimation) ? s.defaultAnimation : enabledAnimations[0],
      };
    });

  const setMany = (ids: string[]) => setSettings((s) => ({ ...s, enabledStyles: ids, defaultStyle: ids.includes(s.defaultStyle) ? s.defaultStyle : ids[0] }));

  const save = () =>
    startTransition(async () => {
      const result = await saveAvatarSettings(settings);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSaved(settings);
      toast.success("Avatar settings saved.");
      router.refresh();
    });

  const groups = (["People", "Faces", "Robots & abstract"] as AvatarStyleGroup[]).map((group) => ({
    group,
    styles: AVATAR_STYLES.filter((s) => s.group === group),
  }));

  return (
    <div className="pb-28">
      <GlassPanel className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-medium">Styles people can build with</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {settings.enabledStyles.length} of {AVATAR_STYLES.length} enabled. Every style gets a full trait picker automatically. Click ★ to make one the default.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="cursor-pointer rounded-full" onClick={() => setMany(AVATAR_STYLES.map((s) => s.id))}>
              Enable all
            </Button>
            <Button type="button" variant="outline" size="sm" className="cursor-pointer rounded-full" onClick={() => setMany(DEFAULT_AVATAR_SETTINGS.enabledStyles)}>
              Recommended
            </Button>
            <Button type="button" variant="outline" size="sm" className="cursor-pointer rounded-full" onClick={() => setMany([settings.defaultStyle])}>
              Only default
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-6">
          {groups.map(({ group, styles }) => (
            <div key={group}>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {styles.map((s) => {
                  const on = settings.enabledStyles.includes(s.id);
                  const isDefault = settings.defaultStyle === s.id;
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "relative rounded-2xl border p-3 transition-all",
                        on ? "border-primary/60 bg-primary/5" : "border-border/60 opacity-70 hover:opacity-100",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleStyle(s.id)}
                        className="block w-full cursor-pointer text-left"
                        aria-pressed={on}
                        aria-label={`${on ? "Disable" : "Enable"} ${s.label}`}
                      >
                        <StylePreview id={s.id} />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{s.label}</p>
                          <span
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full border",
                              on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                            )}
                          >
                            {on && <CheckIcon size={11} weight="bold" />}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.blurb}</p>
                      </button>
                      {on && (
                        <button
                          type="button"
                          onClick={() => patch({ defaultStyle: s.id })}
                          className={cn(
                            "mt-2 flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            isDefault ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground",
                          )}
                          aria-label={isDefault ? `${s.label} is the default` : `Make ${s.label} the default`}
                        >
                          <StarIcon size={11} weight={isDefault ? "fill" : "regular"} /> {isDefault ? "Default style" : "Make default"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <GlassPanel className="flex flex-col gap-5 p-6">
          <h2 className="font-medium">Builder options</h2>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Let people switch styles</p>
              <p className="text-xs text-muted-foreground">Off: everyone builds in the default style and the style picker is hidden.</p>
            </div>
            <Switch checked={settings.allowStyleChoice} onCheckedChange={(v) => patch({ allowStyleChoice: v })} className="mt-1 cursor-pointer" aria-label="Let people switch styles" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Background color picker</p>
              <p className="text-xs text-muted-foreground">Lets people put their avatar on a colored tile.</p>
            </div>
            <Switch checked={settings.allowBackground} onCheckedChange={(v) => patch({ allowBackground: v })} className="mt-1 cursor-pointer" aria-label="Background color picker" />
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="font-medium">Idle animations</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Motions people can give their avatar on the card. Click ★ to set the starting one.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVATAR_ANIMATIONS.map((a) => {
              const on = settings.enabledAnimations.includes(a.id);
              const isDefault = settings.defaultAnimation === a.id;
              return (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center overflow-hidden rounded-full border text-sm",
                    on ? "border-primary bg-primary/10" : "border-border text-muted-foreground",
                  )}
                >
                  <button type="button" onClick={() => toggleAnimation(a.id)} className="cursor-pointer px-3.5 py-1.5" aria-pressed={on}>
                    {a.label}
                  </button>
                  {on && (
                    <button
                      type="button"
                      onClick={() => patch({ defaultAnimation: a.id })}
                      className={cn("cursor-pointer py-1.5 pl-1 pr-3", isDefault ? "text-gold" : "text-muted-foreground hover:text-foreground")}
                      aria-label={isDefault ? `${a.label} is the default` : `Make ${a.label} the default`}
                    >
                      <StarIcon size={13} weight={isDefault ? "fill" : "regular"} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 px-4 py-3 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{dirty ? "You have unsaved changes." : "All changes saved."}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="cursor-pointer rounded-full" onClick={() => setSettings(saved)} disabled={pending || !dirty}>
              Discard
            </Button>
            <Button type="button" className="cursor-pointer rounded-full" onClick={save} disabled={pending || !dirty}>
              <FloppyDiskIcon size={15} weight="bold" /> {pending ? "Saving…" : "Save avatar settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
