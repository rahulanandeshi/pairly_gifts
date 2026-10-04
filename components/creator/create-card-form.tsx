"use client";

import * as React from "react";
import { toast } from "sonner";
import { UploadSimpleIcon, ImageIcon, PaintBrushIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCard, uploadCardImage } from "@/app/creator/actions";
import { cn } from "@/lib/utils";

const ANIMATION_OPTIONS: { value: string; label: string }[] = [
  { value: "GENTLE_UNFOLD", label: "Gentle Unfold" },
  { value: "CONFETTI_BURST", label: "Confetti Burst" },
  { value: "WARM_GLOW", label: "Warm Glow" },
  { value: "FLOATING_PETALS", label: "Floating Petals" },
  { value: "LANTERN_RISE", label: "Lantern Rise" },
];

interface CreateCardFormProps {
  occasions: { slug: string; name: string }[];
  cultures: { slug: string; name: string }[];
}

function useImageUpload() {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [key, setKey] = React.useState<string | null>(null);

  const upload = async (file: File) => {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadCardImage(formData);
    setUploading(false);
    if ("error" in result) {
      toast.error(result.error);
      return null;
    }
    setKey(result.key);
    return result;
  };

  const clear = () => {
    setPreview(null);
    setKey(null);
  };

  return { preview, uploading, key, upload, clear };
}

export function CreateCardForm({ occasions, cultures }: CreateCardFormProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [occasionSlug, setOccasionSlug] = React.useState(occasions[0]?.slug ?? "");
  const [cultureSlugs, setCultureSlugs] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState("");
  const [premium, setPremium] = React.useState(false);
  const [price, setPrice] = React.useState("4.99");
  const [animationStyle, setAnimationStyle] = React.useState("GENTLE_UNFOLD");
  const [paletteFrom, setPaletteFrom] = React.useState("#4338CA");
  const [paletteTo, setPaletteTo] = React.useState("#8F7FF2");
  const [submitting, setSubmitting] = React.useState(false);

  const cover = useImageUpload();
  const [coverWidth, setCoverWidth] = React.useState("");
  const [coverHeight, setCoverHeight] = React.useState("");

  const [contentMode, setContentMode] = React.useState<"app" | "upload">("app");
  const content = useImageUpload();

  const toggleCulture = (slug: string) => {
    setCultureSlugs((s) => (s.includes(slug) ? s.filter((c) => c !== slug) : [...s, slug]));
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new window.Image();
    img.onload = () => {
      setCoverWidth(String(img.naturalWidth));
      setCoverHeight(String(img.naturalHeight));
    };
    img.src = URL.createObjectURL(file);
    await cover.upload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Add a title and description.");
      return;
    }
    if (cultureSlugs.length === 0) {
      toast.error("Pick at least one culture.");
      return;
    }
    setSubmitting(true);
    const result = await createCard({
      title,
      description,
      occasionSlug,
      cultureSlugs,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      premium,
      price: premium ? Number(price) || 0 : 0,
      animationStyle: animationStyle as never,
      paletteFrom,
      paletteTo,
      coverImageUrl: cover.key,
      coverImageWidth: coverWidth ? Number(coverWidth) : null,
      coverImageHeight: coverHeight ? Number(coverHeight) : null,
      contentImageUrl: contentMode === "upload" ? content.key : null,
    });
    // createCard redirects on success, so we only reach here on error.
    setSubmitting(false);
    if (result?.error) toast.error(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <GlassPanel className="p-6">
        <h2 className="font-medium">Card Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="card-title">Title</Label>
            <Input id="card-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Golden Diya Birthday Wishes" className="h-11" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="card-description">Description</Label>
            <Textarea id="card-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What makes this card special?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-occasion">Occasion</Label>
            <Select value={occasionSlug} onValueChange={(v) => v && setOccasionSlug(v as string)}>
              <SelectTrigger id="card-occasion" className="h-11 w-full rounded-lg">
                <SelectValue>{(v: string) => occasions.find((o) => o.slug === v)?.name ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {occasions.map((o) => (
                  <SelectItem key={o.slug} value={o.slug}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card-animation">Animation Style</Label>
            <Select value={animationStyle} onValueChange={(v) => v && setAnimationStyle(v as string)}>
              <SelectTrigger id="card-animation" className="h-11 w-full rounded-lg">
                <SelectValue>{(v: string) => ANIMATION_OPTIONS.find((a) => a.value === v)?.label ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_OPTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="card-tags">Tags (comma separated)</Label>
            <Input id="card-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="warm, family, celebration" className="h-11" />
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h2 className="font-medium">Cover Image (first page)</h2>
        <p className="mt-1 text-xs text-muted-foreground">Shown on the card tile and as the front of the card. Falls back to the palette gradient if you skip this.</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex aspect-[4/5] w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
            {cover.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover.preview} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={22} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <label className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-primary/50">
              <UploadSimpleIcon size={15} /> {cover.uploading ? "Uploading…" : cover.key ? "Replace Image" : "Upload Cover Image"}
              <input type="file" accept="image/*" onChange={handleCoverChange} disabled={cover.uploading} className="hidden" />
            </label>
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cover-width" className="text-xs">Width (px)</Label>
                <Input id="cover-width" value={coverWidth} onChange={(e) => setCoverWidth(e.target.value)} inputMode="numeric" className="h-9 w-24" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cover-height" className="text-xs">Height (px)</Label>
                <Input id="cover-height" value={coverHeight} onChange={(e) => setCoverHeight(e.target.value)} inputMode="numeric" className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h2 className="font-medium">Cultures</h2>
        <p className="mt-1 text-xs text-muted-foreground">Pick every culture this design represents.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {cultures.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => toggleCulture(c.slug)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                cultureSlugs.includes(c.slug) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <h2 className="font-medium">Second Page (content)</h2>
        <p className="mt-1 text-xs text-muted-foreground">What the recipient sees when they open the card — upload your own, or let Pairly customize it from your palette and animation style.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setContentMode("app")}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-colors",
              contentMode === "app" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
            )}
          >
            <PaintBrushIcon size={18} className="text-primary" />
            <span className="text-sm font-medium">Customize in app</span>
          </button>
          <button
            type="button"
            onClick={() => setContentMode("upload")}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-xl border px-4 py-4 text-center transition-colors",
              contentMode === "upload" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
            )}
          >
            <UploadSimpleIcon size={18} className="text-primary" />
            <span className="text-sm font-medium">Upload an image</span>
          </button>
        </div>

        {contentMode === "upload" && (
          <div className="mt-4 flex items-center gap-4">
            <div className="flex aspect-[4/5] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
              {content.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.preview} alt="Content preview" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon size={20} className="text-muted-foreground" />
              )}
            </div>
            <label className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:border-primary/50">
              <UploadSimpleIcon size={15} /> {content.uploading ? "Uploading…" : content.key ? "Replace Image" : "Upload Content Image"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) content.upload(file);
                }}
                disabled={content.uploading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </GlassPanel>

      <GlassPanel className="p-6">
        <h2 className="font-medium">Palette</h2>
        <p className="mt-1 text-xs text-muted-foreground">Used as the fallback look wherever you haven&apos;t uploaded an image.</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="palette-from">From</Label>
            <input id="palette-from" type="color" value={paletteFrom} onChange={(e) => setPaletteFrom(e.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-border" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="palette-to">To</Label>
            <input id="palette-to" type="color" value={paletteTo} onChange={(e) => setPaletteTo(e.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-border" />
          </div>
          <div className="ml-2 h-16 flex-1 rounded-2xl" style={{ background: `linear-gradient(135deg, ${paletteFrom}, ${paletteTo})` }} />
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium">Premium Card</h2>
            <p className="mt-1 text-xs text-muted-foreground">Free cards are available to everyone; premium cards require purchase.</p>
          </div>
          <Switch checked={premium} onCheckedChange={setPremium} />
        </div>
        {premium && (
          <div className="mt-4 flex flex-col gap-1.5 sm:max-w-40">
            <Label htmlFor="card-price">Price ($)</Label>
            <Input id="card-price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="h-11" />
          </div>
        )}
      </GlassPanel>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Submitted cards are reviewed before appearing in the marketplace.</p>
        <Button type="submit" size="lg" disabled={submitting || cover.uploading || content.uploading} className="h-11 cursor-pointer rounded-full px-6">
          {submitting ? "Submitting…" : "Submit for Review"}
        </Button>
      </div>
    </form>
  );
}
