"use client";

import * as React from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { MagicWandIcon, ArrowsClockwiseIcon, UserCircleIcon, CaretDownIcon, UploadSimpleIcon, SparkleIcon } from "@phosphor-icons/react";
import { StepShell } from "@/components/wizard/step-shell";
import { AvatarSvg } from "@/components/wizard/avatar-svg";
import { AvatarStyleBuilder } from "@/components/wizard/avatar-style-builder";
import { useAvatarSettings } from "@/components/avatar-settings-provider";
// Earlier single-style "Build an Avatar" pickers, kept until the generic
// builder is signed off: components/wizard/lorelei-avatar-picker.tsx (Lorelei)
// and components/wizard/dicebear-avatar-picker.tsx (avataaars).
// import { LoreleiAvatarPicker } from "@/components/wizard/lorelei-avatar-picker";
// import { DicebearAvatarPicker } from "@/components/wizard/dicebear-avatar-picker";
import { MetaPersonAvatarEmbed } from "@/components/wizard/metaperson-avatar-embed";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWizardStore } from "@/lib/store/wizard-store";
import { generateMessage, RELATIONSHIPS, EMOTIONS, TONES } from "@/lib/message-generator";
import { TextOverlayEditor } from "@/components/wizard/text-overlay-editor";
import { AVATAR_ANIMATIONS } from "@/lib/avatar/styles";
import { uploadWizardMedia } from "@/app/create/upload-actions";
import { generateFamilyIllustrationArt } from "@/app/create/actions";
import { ILLUSTRATION_STYLES } from "@/lib/illustration-styles";
import type { GreetingCard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type AvatarMode = "dicebear" | "photo" | "illustration";

export function PersonalizeStep({ cards }: { cards: GreetingCard[] }) {
  const { occasion, cardId, message, tone, recipientName, recipientEmail, avatar, setField, setAvatar } = useWizardStore(
    useShallow((s) => ({
      occasion: s.occasion,
      cardId: s.cardId,
      message: s.message,
      tone: s.tone,
      recipientName: s.recipientName,
      recipientEmail: s.recipientEmail,
      avatar: s.avatar,
      setField: s.setField,
      setAvatar: s.setAvatar,
    })),
  );
  const selectedCard = cards.find((c) => c.id === cardId);
  const avatarSettings = useAvatarSettings();
  const animations = AVATAR_ANIMATIONS.filter((a) => avatarSettings.enabledAnimations.includes(a.id));

  // --- message ---
  const [relationship, setRelationship] = React.useState(RELATIONSHIPS[0]);
  const [emotion, setEmotion] = React.useState(EMOTIONS[0]);
  const [generating, setGenerating] = React.useState(false);
  const seedRef = React.useRef(0);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      seedRef.current += 1;
      const generated = generateMessage({ recipientName, relationship, emotion, tone, occasion, seed: seedRef.current });
      setField("message", generated);
      setGenerating(false);
    }, 750);
  };

  // --- avatar / illustration (optional, collapsed by default) ---
  const [avatarOpen, setAvatarOpen] = React.useState(false);
  const [avatarMode, setAvatarMode] = React.useState<AvatarMode>(avatar.kind === "illustration" ? "illustration" : "dicebear");
  const [description, setDescription] = React.useState("");
  const [photoKey, setPhotoKey] = React.useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [style, setStyle] = React.useState<string>(ILLUSTRATION_STYLES[0].id);
  const [illustrationGenerating, setIllustrationGenerating] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(avatar.kind === "illustration" ? avatar.imageUrl : null);

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", "photo");
    const result = await uploadWizardMedia(formData);
    setUploading(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setPhotoKey(result.key);
    setPhotoPreview(result.previewUrl);
  };

  const handleGenerateIllustration = async () => {
    if (!description.trim() && !photoKey) {
      toast.error("Add a description or upload a photo first.");
      return;
    }
    setIllustrationGenerating(true);
    const result = await generateFamilyIllustrationArt({ description, referencePhotoKey: photoKey ?? undefined, style });
    setIllustrationGenerating(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setPreviewUrl(result.url);
  };

  const useIllustration = () => {
    if (!previewUrl) return;
    setAvatar({ kind: "illustration", imageUrl: previewUrl, glbUrl: undefined, style });
    toast.success("Illustration set as your avatar.");
  };

  return (
    <StepShell
      slug="personalize"
      title="Personalize it"
      description="Write your message, then optionally add a face to the card."
      nextDisabled={!message.trim() || !recipientName.trim() || !recipientEmail.trim()}
      cards={cards}
    >
      <GlassPanel className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Recipient&apos;s name</Label>
            <Input value={recipientName} onChange={(e) => setField("recipientName", e.target.value)} placeholder="e.g. Amara" className="h-11" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Recipient&apos;s email</Label>
            <Input
              type="email"
              value={recipientEmail}
              onChange={(e) => setField("recipientEmail", e.target.value)}
              placeholder="amara@example.com"
              className="h-11"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Relationship</Label>
            <Select value={relationship} onValueChange={(v) => v && setRelationship(v)}>
              <SelectTrigger className="h-11 w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIPS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Emotion</Label>
            <Select value={emotion} onValueChange={(v) => v && setEmotion(v)}>
              <SelectTrigger className="h-11 w-full rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EMOTIONS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => v && setField("tone", v)}>
              <SelectTrigger className="h-11 w-full rounded-lg">
                <SelectValue>{(v: string) => TONES.find((t) => t.id === v)?.label ?? v}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="mt-5 h-11 w-full cursor-pointer gap-2 rounded-full sm:w-auto"
        >
          <MagicWandIcon size={16} weight="fill" className={cn(generating && "animate-spin")} />
          {generating ? "Generating…" : message ? "Regenerate Message" : "Generate Message"}
        </Button>

        <div className="mt-6">
          <Label htmlFor="message-body">Your message</Label>
          <Textarea
            id="message-body"
            value={message}
            onChange={(e) => setField("message", e.target.value)}
            rows={6}
            placeholder="Write from the heart, or generate a starting point above…"
            className="mt-1.5"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{message.length} characters</span>
            {message && (
              <button type="button" onClick={handleGenerate} className="inline-flex cursor-pointer items-center gap-1 hover:text-foreground">
                <ArrowsClockwiseIcon size={12} /> Try another version
              </button>
            )}
          </div>
        </div>
      </GlassPanel>

      {selectedCard && (
        <GlassPanel className="mt-6 p-6">
          <TextOverlayEditor
            coverImageUrl={selectedCard.coverImageUrl ?? null}
            paletteFrom={selectedCard.paletteFrom}
            paletteTo={selectedCard.paletteTo}
          />
        </GlassPanel>
      )}

      <GlassPanel className="mt-6 overflow-hidden p-0">
        <button type="button" onClick={() => setAvatarOpen((v) => !v)} className="flex w-full cursor-pointer items-center justify-between p-6 text-left">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCircleIcon size={19} weight="duotone" />
            </span>
            <div>
              <p className="text-sm font-medium">Add a face to your card</p>
              <p className="text-xs text-muted-foreground">Optional — build a 3D avatar or generate an illustration.</p>
            </div>
          </div>
          <CaretDownIcon size={16} className={cn("shrink-0 text-muted-foreground transition-transform", avatarOpen && "rotate-180")} />
        </button>

        {avatarOpen && (
          <div className="grid gap-8 border-t border-border/60 p-6 lg:grid-cols-[minmax(0,220px)_1fr]">
            <div className="flex flex-col items-center gap-3">
              <div className="aspect-square w-full max-w-[180px]">
                <AvatarSvg config={avatar} />
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {avatar.kind === "avatar" ? "3D Avatar" : "AI Illustration"}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setAvatarMode("dicebear")}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border p-3 text-left transition-all",
                    avatarMode === "dicebear" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                  )}
                >
                  <p className="text-sm font-medium">Build an Avatar</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode("photo")}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border p-3 text-left transition-all",
                    avatarMode === "photo" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                  )}
                >
                  <p className="text-sm font-medium">Photo Avatar</p>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode("illustration")}
                  className={cn(
                    "flex flex-1 cursor-pointer items-center gap-2 rounded-2xl border p-3 text-left transition-all",
                    avatarMode === "illustration" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                  )}
                >
                  <p className="text-sm font-medium">Generate an Illustration</p>
                </button>
              </div>

              {avatarMode === "dicebear" ? (
                <div className="mt-4">
                  <AvatarStyleBuilder
                    onChange={(imageUrl) =>
                      setAvatar({
                        kind: "avatar",
                        imageUrl,
                        glbUrl: undefined,
                        // First build (or an animation the admin has since disabled) falls back to the configured default.
                        ...(avatar.animation && avatarSettings.enabledAnimations.includes(avatar.animation)
                          ? {}
                          : { animation: avatarSettings.defaultAnimation }),
                      })
                    }
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {animations.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setAvatar({ animation: a.id })}
                        className={cn(
                          "glass-panel cursor-pointer rounded-full px-3 py-1.5 text-xs transition-all",
                          avatar.animation === a.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
                        )}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : avatarMode === "photo" ? (
                <div className="mt-4">
                  <MetaPersonAvatarEmbed
                    className="overflow-hidden rounded-2xl border border-border/60"
                    onExported={({ imageUrl, glbUrl }) => {
                      setAvatar({ kind: "avatar", imageUrl, glbUrl });
                      toast.success("Avatar saved.");
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-4">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="A mom, dad, and two kids laughing together in a sunny backyard…"
                  />
                  <div>
                    {photoPreview ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 preview URL */}
                        <img src={photoPreview} alt="Reference" className="size-16 rounded-xl object-cover" />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setPhotoKey(null);
                            setPhotoPreview(null);
                          }}
                          className="cursor-pointer rounded-full text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          id="personalize-photo-upload"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          onClick={() => document.getElementById("personalize-photo-upload")?.click()}
                          className="h-10 cursor-pointer gap-2 rounded-full px-5 text-sm"
                        >
                          <UploadSimpleIcon size={15} /> {uploading ? "Uploading…" : "Upload Photo"}
                        </Button>
                      </>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {ILLUSTRATION_STYLES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStyle(s.id)}
                        className={cn(
                          "glass-panel cursor-pointer rounded-xl px-3 py-2.5 text-sm transition-all",
                          style === s.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <Button
                    type="button"
                    disabled={illustrationGenerating}
                    onClick={handleGenerateIllustration}
                    className="h-11 cursor-pointer gap-2 self-start rounded-full px-6"
                  >
                    <SparkleIcon size={16} weight="fill" /> {illustrationGenerating ? "Generating…" : "Generate Illustration"}
                  </Button>
                  {previewUrl && (
                    <div className="flex items-center gap-4 border-t border-border/60 pt-4">
                      {/* eslint-disable-next-line @next/next/no-img-element -- AI-generated illustration URL */}
                      <img src={previewUrl} alt="Generated illustration" className="size-20 rounded-2xl object-cover shadow-lg" />
                      <Button type="button" onClick={useIllustration} className="cursor-pointer rounded-full">
                        Use This Illustration
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </GlassPanel>
    </StepShell>
  );
}
