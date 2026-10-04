"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import {
  PlayIcon,
  PauseIcon,
  GiftIcon,
  SpeakerHighIcon,
  StopIcon,
  ClockIcon,
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  ChatCircleDotsIcon,
  LinkIcon,
  LockSimpleIcon,
  CheckCircleIcon,
  HouseIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import { StepShell } from "@/components/wizard/step-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarSvg } from "@/components/wizard/avatar-svg";
import { Waveform } from "@/components/shared/waveform";
import { SceneCanvas } from "@/components/three/canvas-scene";
import { ConfettiBurst } from "@/components/three/particle-field";
import { useWizardStore } from "@/lib/store/wizard-store";
import { useFeatures } from "@/components/features-provider";
import { refreshPlaybackUrl } from "@/app/create/upload-actions";
import { useSpeechReader } from "@/lib/use-speech-reader";
import { getOccasion, giftBrands, type GreetingCard } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { createPaymentIntent, finalizeOrder, createSubscriptionCheckoutSession, confirmSubscription } from "@/app/create/actions";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TIMES = ["9:00 AM", "10:00 AM", "12:00 PM", "3:00 PM", "6:00 PM", "9:00 PM"];
const CHANNELS: { id: "email" | "sms" | "link"; label: string; icon: typeof EnvelopeSimpleIcon }[] = [
  { id: "email", label: "Email", icon: EnvelopeSimpleIcon },
  { id: "sms", label: "Text Message", icon: ChatCircleDotsIcon },
  { id: "link", label: "Shareable Link", icon: LinkIcon },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

export function SendStep({ cards }: { cards: GreetingCard[] }) {
  const rawState = useWizardStore((s) => s);
  const { giftCards } = useFeatures();
  // With gift cards off, a gift picked earlier is ignored — never priced, sent, or shown.
  const state = React.useMemo(
    () => (giftCards ? rawState : { ...rawState, giftBrand: null, giftAmount: null }),
    [rawState, giftCards],
  );
  const reset = useWizardStore((s) => s.reset);
  const setField = useWizardStore((s) => s.setField);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- preview ----
  const [played, setPlayed] = React.useState(false);
  const [previewConfetti, setPreviewConfetti] = React.useState(0);
  const [audioPlaying, setAudioPlaying] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const card = state.cardId ? cards.find((c) => c.id === state.cardId) : undefined;
  const reader = useSpeechReader(card?.description ?? "");

  React.useEffect(() => {
    if (!state.audioUrl) return;
    refreshPlaybackUrl(state.audioUrl).then((result) => {
      if ("success" in result) setPreviewUrl(result.url ?? null);
    });
  }, [state.audioUrl]);

  const occasionMeta = state.occasion ? getOccasion(state.occasion) : undefined;
  const brand = giftBrands.find((b) => b.id === state.giftBrand);
  const playPreview = () => {
    setPlayed(true);
    setTimeout(() => setPreviewConfetti((t) => t + 1), 900);
  };

  // ---- schedule ----
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState(TIMES[2]);
  const disabledMatcher = React.useMemo(() => ({ before: new Date() }), []);

  React.useEffect(() => {
    if (state.deliveryMode === "schedule" && date) {
      setField("scheduleDate", `${date.toDateString()} at ${time}`);
      const [, minutesRaw] = time.split(":");
      const isPM = time.includes("PM");
      let hours = parseInt(time, 10);
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
      const minutes = parseInt(minutesRaw, 10);
      const at = new Date(date);
      at.setHours(hours, minutes, 0, 0);
      setField("scheduleAt", at.toISOString());
    } else {
      setField("scheduleDate", null);
      setField("scheduleAt", null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.deliveryMode, date, time]);

  // ---- checkout ----
  const [plan, setPlan] = React.useState<"one-time" | "subscription">("one-time");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<{ greetingId: string; deliveryMode: "now" | "schedule"; scheduleDate: string | null } | null>(null);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [subscribing, setSubscribing] = React.useState(false);

  const cardPrice = card?.premium ? card.price : 0;
  const giftPrice = state.giftAmount ?? 0;
  const subtotal = cardPrice + giftPrice;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  // Returning from a subscription Checkout Session redirect.
  React.useEffect(() => {
    const subscribed = searchParams.get("subscribed");
    const sessionId = searchParams.get("session_id");
    if (subscribed !== "1" || !sessionId) return;
    confirmSubscription(sessionId).then((result) => {
      if ("error" in result) toast.error(result.error);
      else toast.success("You're now a Premium subscriber!");
      router.replace("/create/send");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Create (or refresh) the PaymentIntent whenever the one-time total changes.
  React.useEffect(() => {
    if (plan !== "one-time" || total <= 0 || !state.cardId) {
      setClientSecret(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    createPaymentIntent({ cardId: state.cardId, giftAmount: state.giftAmount }).then((result) => {
      if (cancelled) return;
      setLoading(false);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setClientSecret(result.clientSecret);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan, total, state.cardId, state.giftAmount]);

  const handleFinalize = async (paymentIntentId?: string) => {
    if (!state.cardId) return false;
    const result = await finalizeOrder({
      cardId: state.cardId,
      avatar: state.avatar,
      recipientName: state.recipientName,
      recipientEmail: state.recipientEmail,
      recipientPhone: state.recipientPhone,
      deliveryChannel: state.deliveryChannel,
      message: state.message,
      textOverlays: state.textOverlays,
      audioUrl: state.audioUrl,
      giftBrandId: state.giftBrand,
      giftAmount: state.giftAmount,
      deliveryMode: state.deliveryMode,
      scheduleAt: state.scheduleAt,
      paymentIntentId,
    });
    if ("error" in result) {
      toast.error(result.error);
      return false;
    }
    setSuccess({ greetingId: result.sentGreetingId, deliveryMode: state.deliveryMode, scheduleDate: state.scheduleDate });
    setConfettiTrigger((t) => t + 1);
    reset();
    return true;
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    const result = await createSubscriptionCheckoutSession();
    if ("error" in result) {
      setSubscribing(false);
      toast.error(result.error);
      return;
    }
    window.location.href = result.url;
  };

  if (success) {
    return (
      <StepShell slug="send" title="" hideNext>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <SceneCanvas cameraPosition={[0, 0, 6]}>
              <ConfettiBurst trigger={confettiTrigger} origin={[0, 1, 0]} />
            </SceneCanvas>
          </div>
          <GlassPanel className="flex flex-col items-center gap-4 p-12 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircleIcon size={30} weight="fill" />
            </span>
            <h2 className="font-display text-3xl">
              {success.deliveryMode === "schedule" ? "Your card is scheduled!" : "Your card is on its way!"}
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              {success.deliveryMode === "schedule"
                ? `It will arrive ${success.scheduleDate ?? "at your chosen time"}.`
                : "The recipient will receive it any moment now."}
            </p>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(`${window.location.origin}/gift/${success.greetingId}`);
                toast.success("Gift link copied.");
              }}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <CopyIcon size={13} /> Copy gift link
            </button>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button render={<Link href="/dashboard" />} size="lg" className="h-11 cursor-pointer rounded-full px-6">
                <HouseIcon size={16} weight="fill" /> Go to Dashboard
              </Button>
              <Button render={<Link href="/create/card" />} variant="outline" size="lg" className="h-11 cursor-pointer rounded-full px-6">
                Create Another Card
              </Button>
            </div>
          </GlassPanel>
        </div>
      </StepShell>
    );
  }

  return (
    <StepShell slug="send" title="Review & send" description="One last look, then choose when it should arrive." hideNext cards={cards}>
      <div>
        <SectionLabel>Preview</SectionLabel>
        <GlassPanel className="relative overflow-hidden p-8">
          <div className="absolute inset-0 -z-10">
            <SceneCanvas cameraPosition={[0, 0, 6]}>
              <ConfettiBurst trigger={previewConfetti} origin={[0, 1, 0]} />
            </SceneCanvas>
          </div>

          {!played ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <div
                className="flex size-20 items-center justify-center rounded-full text-white shadow-xl"
                style={{ background: card ? `linear-gradient(135deg, ${card.paletteFrom}, ${card.paletteTo})` : "var(--primary)" }}
              >
                <Button size="icon" onClick={playPreview} className="size-16 cursor-pointer rounded-full bg-transparent shadow-none hover:bg-white/10">
                  <PlayIcon size={26} weight="fill" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Tap to preview the full experience</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6 py-4 text-center">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="w-28">
                <AvatarSvg config={state.avatar} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <p className="font-display text-2xl">
                  {occasionMeta ? `Happy ${occasionMeta.name}${state.recipientName ? `, ${state.recipientName}` : ""}!` : "Happy Celebration!"}
                </p>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{state.message || "Your heartfelt message will appear here."}</p>
              </motion.div>

              {previewUrl ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                  <button
                    type="button"
                    onClick={() => (audioPlaying ? audioRef.current?.pause() : audioRef.current?.play())}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-muted/60 px-4 py-2 transition-colors hover:bg-muted"
                  >
                    {audioPlaying ? (
                      <PauseIcon size={16} weight="fill" className="text-electric" />
                    ) : (
                      <PlayIcon size={16} weight="fill" className="text-electric" />
                    )}
                    <Waveform playing={audioPlaying} bars={26} className="h-6" />
                    <audio
                      ref={audioRef}
                      src={previewUrl}
                      onPlay={() => setAudioPlaying(true)}
                      onPause={() => setAudioPlaying(false)}
                      onEnded={() => setAudioPlaying(false)}
                      className="hidden"
                    />
                  </button>
                </motion.div>
              ) : (
                card &&
                reader.supported && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                    <button
                      type="button"
                      onClick={reader.toggle}
                      className="flex cursor-pointer items-center gap-2 rounded-full bg-muted/60 px-4 py-2 transition-colors hover:bg-muted"
                    >
                      {reader.speaking ? (
                        <StopIcon size={16} weight="fill" className="text-electric" />
                      ) : (
                        <SpeakerHighIcon size={16} weight="fill" className="text-electric" />
                      )}
                      <Waveform playing={reader.speaking} bars={26} className="h-6" />
                    </button>
                  </motion.div>
                )
              )}

              {brand && state.giftAmount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-medium text-gold"
                >
                  <GiftIcon size={16} weight="fill" /> ${state.giftAmount} {brand.name} Gift Card
                </motion.div>
              )}
            </motion.div>
          )}
        </GlassPanel>
      </div>

      <div className="mt-8">
        <SectionLabel>Delivery</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setField("deliveryMode", "now")}
            className={cn(
              "glass-panel flex cursor-pointer items-center gap-4 rounded-2xl p-5 text-left transition-all",
              state.deliveryMode === "now" ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ClockIcon size={20} weight="duotone" />
            </span>
            <div>
              <p className="font-medium">Send Now</p>
              <p className="text-xs text-muted-foreground">Delivered the moment you check out.</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setField("deliveryMode", "schedule")}
            className={cn(
              "glass-panel flex cursor-pointer items-center gap-4 rounded-2xl p-5 text-left transition-all",
              state.deliveryMode === "schedule" ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarBlankIcon size={20} weight="duotone" />
            </span>
            <div>
              <p className="font-medium">Schedule for Later</p>
              <p className="text-xs text-muted-foreground">Pick the exact date and time.</p>
            </div>
          </button>
        </div>

        {state.deliveryMode === "schedule" && (
          <GlassPanel className="mt-6 grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
            <Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledMatcher} className="mx-auto" />
            <div>
              <p className="text-sm font-medium">Delivery time</p>
              <Select value={time} onValueChange={(v) => v && setTime(v)}>
                <SelectTrigger className="mt-2 h-11 w-full rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.scheduleDate && <p className="mt-4 text-sm text-muted-foreground">Arriving {state.scheduleDate}</p>}
            </div>
          </GlassPanel>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium">How should we deliver it?</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {CHANNELS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setField("deliveryChannel", c.id)}
                className={cn(
                  "glass-panel flex cursor-pointer flex-col items-center gap-2 rounded-xl px-3 py-4 text-center transition-all",
                  state.deliveryChannel === c.id ? "ring-2 ring-primary" : "hover:-translate-y-0.5",
                )}
              >
                <c.icon size={18} weight="duotone" className="text-primary" />
                <span className="text-xs font-medium">{c.label}</span>
              </button>
            ))}
          </div>
          {state.deliveryChannel === "sms" && (
            <div className="mt-4 flex flex-col gap-1.5 sm:max-w-xs">
              <Label htmlFor="recipient-phone">Recipient&apos;s phone number</Label>
              <Input
                id="recipient-phone"
                type="tel"
                value={state.recipientPhone}
                onChange={(e) => setField("recipientPhone", e.target.value)}
                placeholder="+1 555 123 4567"
                className="h-11"
              />
            </div>
          )}
          {state.deliveryChannel === "link" && (
            <p className="mt-4 text-xs text-muted-foreground">We won&apos;t send anything automatically — you&apos;ll get a shareable link to send yourself.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Checkout</SectionLabel>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPlan("one-time")}
                className={cn(
                  "flex-1 cursor-pointer rounded-2xl border p-4 text-left transition-all",
                  plan === "one-time" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                )}
              >
                <p className="text-sm font-medium">One-Time Purchase</p>
                <p className="text-xs text-muted-foreground">{giftCards ? "Pay only for this card and gift." : "Pay only for this card."}</p>
              </button>
              <button
                type="button"
                onClick={() => setPlan("subscription")}
                className={cn(
                  "flex-1 cursor-pointer rounded-2xl border p-4 text-left transition-all",
                  plan === "subscription" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border",
                )}
              >
                <p className="text-sm font-medium">Subscribe & Save</p>
                <p className="text-xs text-muted-foreground">$12/mo for unlimited cards.</p>
              </button>
            </div>

            {plan === "subscription" ? (
              <div className="mt-6 flex flex-col gap-4">
                <Button onClick={handleSubscribe} disabled={subscribing} size="lg" className="h-12 cursor-pointer rounded-full text-base">
                  {subscribing ? "Redirecting to Stripe…" : "Subscribe — $12.00/mo"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">Handled by Stripe Checkout. This card can be sent separately once you&apos;re subscribed.</p>
              </div>
            ) : total <= 0 ? (
              <div className="mt-6">
                <Button onClick={() => handleFinalize()} size="lg" className="h-12 w-full cursor-pointer rounded-full text-base">
                  Complete Purchase — Free
                </Button>
              </div>
            ) : clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm total={total} onSuccess={handleFinalize} />
              </Elements>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">{loading ? "Preparing payment…" : "Select a card to continue."}</p>
            )}
          </div>

          <GlassPanel className="h-fit p-6">
            <h3 className="font-medium">Order Summary</h3>
            <div className="mt-4 flex flex-col gap-2.5 text-sm">
              {plan === "subscription" ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Premium Monthly</span>
                  <span>$12.00</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{card?.title ?? "Greeting card"}</span>
                    <span>{cardPrice > 0 ? `$${cardPrice.toFixed(2)}` : "Free"}</span>
                  </div>
                  {brand && state.giftAmount ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{brand.name} gift card</span>
                      <span>${state.giftAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-medium">
              <span>Total</span>
              <span>{plan === "subscription" ? "$12.00/mo" : `$${total.toFixed(2)}`}</span>
            </div>
          </GlassPanel>
        </div>
      </div>
    </StepShell>
  );
}

function StripePaymentForm({ total, onSuccess }: { total: number; onSuccess: (paymentIntentId: string) => Promise<boolean> }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = React.useState(false);
  const [elementReady, setElementReady] = React.useState(false);
  const [elementFailed, setElementFailed] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: "if_required" });
    if (error) {
      toast.error(error.message ?? "Payment failed.");
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      await onSuccess(paymentIntent.id);
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <PaymentElement
        onReady={() => setElementReady(true)}
        onLoadError={(e) => {
          setElementFailed(true);
          toast.error(e.error.message || "Couldn't load the payment form. Please refresh and try again.");
        }}
      />
      {elementFailed && (
        <p className="text-sm text-destructive">
          The payment form failed to load — check your connection and refresh the page. If this keeps happening, an ad blocker or privacy
          extension may be blocking Stripe.
        </p>
      )}
      {!elementReady && !elementFailed && <p className="text-sm text-muted-foreground">Loading payment form…</p>}
      <Button type="submit" size="lg" disabled={submitting || !stripe || !elementReady} className="mt-2 h-12 cursor-pointer rounded-full text-base">
        {submitting ? "Processing…" : `Complete Purchase — $${total.toFixed(2)}`}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <LockSimpleIcon size={12} /> Secured by Stripe — card details never touch our server.
      </p>
    </form>
  );
}
