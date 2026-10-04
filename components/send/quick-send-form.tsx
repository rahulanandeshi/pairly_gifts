"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  CheckCircleIcon,
  MicrophoneIcon,
  StopIcon,
  UploadSimpleIcon,
  VideoCameraIcon,
  ImageIcon,
  XIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Waveform } from "@/components/shared/waveform";
import { uploadWizardMedia } from "@/app/create/upload-actions";
import { createPaymentIntent, finalizeOrder } from "@/app/create/actions";
import { DEFAULT_AVATAR } from "@/components/wizard/avatar-options";
import { giftBrands } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export type QuickSendType = "gift" | "voice" | "video" | "photos";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface QuickSendFormProps {
  type: QuickSendType;
  cardId: string;
}

export function QuickSendForm({ type, cardId }: QuickSendFormProps) {
  const [recipientName, setRecipientName] = React.useState("");
  const [recipientEmail, setRecipientEmail] = React.useState("");
  const [recipientPhone, setRecipientPhone] = React.useState("");
  const [deliveryChannel, setDeliveryChannel] = React.useState<"email" | "sms">("email");
  const [message, setMessage] = React.useState("");
  const [success, setSuccess] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [audioKey, setAudioKey] = React.useState<string | null>(null);
  const [audioPreview, setAudioPreview] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState(false);
  const [recordedSeconds, setRecordedSeconds] = React.useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const secondsRef = React.useRef(0);

  const [videoKey, setVideoKey] = React.useState<string | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);

  const [photoKeys, setPhotoKeys] = React.useState<string[]>([]);
  const [photoPreviews, setPhotoPreviews] = React.useState<string[]>([]);

  const [giftBrandId, setGiftBrandId] = React.useState<string | null>(null);
  const [giftAmount, setGiftAmount] = React.useState<number | null>(null);
  const [customAmount, setCustomAmount] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [preparingPayment, setPreparingPayment] = React.useState(false);

  const brand = giftBrands.find((b) => b.id === giftBrandId);

  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordedSeconds((s) => (secondsRef.current = s + 1)), 1000);
    return () => clearInterval(id);
  }, [recording]);

  React.useEffect(() => {
    if (type !== "gift" || !giftAmount || giftAmount <= 0) {
      setClientSecret(null);
      return;
    }
    let cancelled = false;
    setPreparingPayment(true);
    createPaymentIntent({ cardId, giftAmount }).then((result) => {
      if (cancelled) return;
      setPreparingPayment(false);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setClientSecret(result.clientSecret);
    });
    return () => {
      cancelled = true;
    };
  }, [type, cardId, giftAmount]);

  const uploadFile = async (file: File, kind: "audio" | "video" | "photo") => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);
    const result = await uploadWizardMedia(formData);
    setUploading(false);
    if ("error" in result) {
      toast.error(result.error);
      return null;
    }
    return result;
  };

  const handleAudioFile = async (file: File) => {
    const result = await uploadFile(file, "audio");
    if (!result) return;
    setAudioKey(result.key);
    setAudioPreview(result.previewUrl);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Your browser doesn't support microphone recording — try uploading a file instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      secondsRef.current = 0;
      setRecordedSeconds(0);
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        handleAudioFile(new File([blob], "recording.webm", { type: blob.type }));
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access was denied — check your browser permissions.");
    }
  };
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleVideoFile = async (file: File) => {
    const result = await uploadFile(file, "video");
    if (!result) return;
    setVideoKey(result.key);
    setVideoPreview(result.previewUrl);
  };

  const handlePhotoFiles = async (files: FileList) => {
    const list = Array.from(files).slice(0, 8 - photoKeys.length);
    for (const file of list) {
      const result = await uploadFile(file, "photo");
      if (!result) continue;
      setPhotoKeys((k) => [...k, result.key]);
      setPhotoPreviews((p) => [...p, result.previewUrl]);
    }
  };

  const removePhoto = (key: string) => {
    const idx = photoKeys.indexOf(key);
    if (idx === -1) return;
    setPhotoKeys((k) => k.filter((x) => x !== key));
    setPhotoPreviews((p) => p.filter((_, i) => i !== idx));
  };

  const contentReady =
    (type === "voice" && !!audioKey) ||
    (type === "video" && !!videoKey) ||
    (type === "photos" && photoKeys.length > 0) ||
    (type === "gift" && !!giftBrandId && !!giftAmount);

  const canSend = !!recipientName.trim() && !!recipientEmail.trim() && (deliveryChannel === "email" || !!recipientPhone.trim()) && contentReady;

  const send = async (paymentIntentId?: string) => {
    setSending(true);
    const result = await finalizeOrder({
      cardId,
      avatar: DEFAULT_AVATAR,
      recipientName,
      recipientEmail,
      recipientPhone: recipientPhone || undefined,
      deliveryChannel,
      message: message.trim() || (type === "gift" ? "A little something for you." : "Sent with Pairly."),
      audioUrl: type === "voice" ? audioKey : null,
      videoUrl: type === "video" ? videoKey : null,
      photoUrls: type === "photos" ? photoKeys : undefined,
      giftBrandId: type === "gift" ? giftBrandId : null,
      giftAmount: type === "gift" ? giftAmount : null,
      deliveryMode: "now",
      scheduleAt: null,
      paymentIntentId,
    });
    setSending(false);
    if ("error" in result) {
      toast.error(result.error);
      return false;
    }
    setSuccess(result.sentGreetingId);
    return true;
  };

  const handleSend = async () => {
    if (!canSend) {
      toast.error("Fill in the required fields first.");
      return;
    }
    await send();
  };

  if (success) {
    return (
      <GlassPanel className="flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircleIcon size={26} weight="fill" />
        </span>
        <h2 className="font-display text-2xl">Sent!</h2>
        <p className="text-sm text-muted-foreground">{recipientName} will get it any moment now.</p>
        <div className="mt-2 flex gap-3">
          <Button render={<Link href="/dashboard" />} className="cursor-pointer rounded-full">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="cursor-pointer rounded-full">
            Send Another
          </Button>
        </div>
      </GlassPanel>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <GlassPanel className="flex flex-col gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Recipient name</Label>
            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jordan" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Recipient email</Label>
            <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} placeholder="jordan@email.com" />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setDeliveryChannel("email")}
            className={cn("flex-1 cursor-pointer rounded-full border px-4 py-2 text-sm", deliveryChannel === "email" ? "border-primary bg-primary/5 text-primary" : "border-border")}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setDeliveryChannel("sms")}
            className={cn("flex-1 cursor-pointer rounded-full border px-4 py-2 text-sm", deliveryChannel === "sms" ? "border-primary bg-primary/5 text-primary" : "border-border")}
          >
            Text message
          </button>
        </div>
        {deliveryChannel === "sms" && (
          <div className="flex flex-col gap-1.5">
            <Label>Recipient phone</Label>
            <Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+1 555 555 5555" />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <Label>Short note (optional)</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} placeholder="Add a quick note…" />
        </div>
      </GlassPanel>

      {type === "voice" && (
        <GlassPanel className="flex flex-col items-center gap-5 p-6">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            className={cn(
              "flex size-20 cursor-pointer items-center justify-center rounded-full text-white shadow-xl transition-all disabled:cursor-not-allowed disabled:opacity-60",
              recording ? "scale-110 animate-pulse bg-destructive" : "bg-primary hover:scale-105",
            )}
            aria-label={recording ? "Stop recording" : "Start recording"}
          >
            {recording ? <StopIcon size={26} weight="fill" /> : <MicrophoneIcon size={26} weight="fill" />}
          </button>
          <p className="text-sm text-muted-foreground">
            {recording ? `Recording… ${recordedSeconds}s` : uploading ? "Uploading…" : audioKey ? "Recording captured" : "Tap to record"}
          </p>
          {audioPreview && (
            <div className="w-full max-w-sm">
              <Waveform seed="quick-send-voice" playing={recording} className="mb-2" />
              <audio src={audioPreview} controls className="w-full" />
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-px w-8 bg-border" /> or <span className="h-px w-8 bg-border" />
          </div>
          <input
            type="file"
            accept="audio/*"
            id="quick-send-audio-upload"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleAudioFile(e.target.files[0])}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading || recording}
            onClick={() => document.getElementById("quick-send-audio-upload")?.click()}
            className="h-10 cursor-pointer gap-2 rounded-full px-5"
          >
            <UploadSimpleIcon size={15} /> Upload Audio File
          </Button>
        </GlassPanel>
      )}

      {type === "video" && (
        <GlassPanel className="p-6">
          {videoPreview ? (
            <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl">
              <video src={videoPreview} controls className="w-full rounded-2xl" />
              <button
                type="button"
                onClick={() => {
                  setVideoKey(null);
                  setVideoPreview(null);
                }}
                className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white"
                aria-label="Remove video"
              >
                <XIcon size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploading}
              onClick={() => document.getElementById("quick-send-video-upload")?.click()}
              className="mx-auto flex aspect-video w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <VideoCameraIcon size={26} />
              <span className="text-sm font-medium">{uploading ? "Uploading…" : "Upload a video"}</span>
            </button>
          )}
          <input
            type="file"
            accept="video/*"
            id="quick-send-video-upload"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
          />
        </GlassPanel>
      )}

      {type === "photos" && (
        <GlassPanel className="p-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photoPreviews.map((url, i) => (
              <div key={photoKeys[i]} className="group relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 preview URL */}
                <img src={url} alt="Uploaded photo" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(photoKeys[i])}
                  className="absolute right-1.5 top-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove photo"
                >
                  <XIcon size={12} />
                </button>
              </div>
            ))}
            {photoKeys.length < 8 && (
              <button
                type="button"
                disabled={uploading}
                onClick={() => document.getElementById("quick-send-photo-upload")?.click()}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImageIcon size={20} />
                <span className="text-xs font-medium">{uploading ? "Uploading…" : "Add Photo"}</span>
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            id="quick-send-photo-upload"
            className="hidden"
            onChange={(e) => e.target.files && handlePhotoFiles(e.target.files)}
          />
        </GlassPanel>
      )}

      {type === "gift" && (
        <GlassPanel className="p-6">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {giftBrands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  setGiftBrandId(giftBrandId === b.id ? null : b.id);
                  setGiftAmount(null);
                  setCustomAmount("");
                }}
                className={cn(
                  "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center text-white shadow-md transition-all",
                  giftBrandId === b.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:-translate-y-1",
                )}
                style={{ background: `linear-gradient(135deg, ${b.gradientFrom}, ${b.gradientTo})` }}
              >
                <span className="text-xs font-semibold leading-tight">{b.name}</span>
              </button>
            ))}
          </div>

          {brand && (
            <div className="mt-6">
              <p className="text-sm font-medium">Choose an amount for {brand.name}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {brand.amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setGiftAmount(amt);
                      setCustomAmount("");
                    }}
                    className={cn(
                      "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      giftAmount === amt ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
                    )}
                  >
                    ${amt}
                  </button>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      const num = Number(e.target.value);
                      setGiftAmount(num > 0 ? num : null);
                    }}
                    placeholder="Custom"
                    className="h-9 w-24 rounded-full"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>
          )}

          {giftAmount && giftAmount > 0 && (
            <div className="mt-6 border-t border-border/60 pt-6">
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <GiftPaymentForm total={giftAmount} canSend={canSend} onPaid={(paymentIntentId) => send(paymentIntentId)} />
                </Elements>
              ) : (
                <p className="text-sm text-muted-foreground">{preparingPayment ? "Preparing payment…" : "Choose a brand and amount to continue."}</p>
              )}
            </div>
          )}
        </GlassPanel>
      )}

      {type !== "gift" && (
        <Button size="lg" disabled={!canSend || sending} onClick={handleSend} className="h-12 cursor-pointer rounded-full text-base">
          {sending ? "Sending…" : "Send Now"}
        </Button>
      )}
    </div>
  );
}

function GiftPaymentForm({ total, canSend, onPaid }: { total: number; canSend: boolean; onPaid: (paymentIntentId: string) => Promise<boolean> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [elementReady, setElementReady] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !canSend) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (error) {
      toast.error(error.message ?? "Payment failed.");
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === "succeeded") await onPaid(paymentIntent.id);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <PaymentElement onReady={() => setElementReady(true)} />
      {!elementReady && <p className="text-sm text-muted-foreground">Loading payment form…</p>}
      <Button type="submit" size="lg" disabled={submitting || !stripe || !elementReady || !canSend} className="h-12 cursor-pointer rounded-full text-base">
        {submitting ? "Processing…" : `Send — $${total.toFixed(2)}`}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <LockSimpleIcon size={12} /> Secured by Stripe.
      </p>
    </form>
  );
}
