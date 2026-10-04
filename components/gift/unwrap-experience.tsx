"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  HandPointingIcon,
  GiftIcon,
  DownloadSimpleIcon,
  ShareNetworkIcon,
  ChatCircleTextIcon,
  ArrowUUpLeftIcon,
  ArrowsClockwiseIcon,
  HandHeartIcon,
  PaperPlaneRightIcon,
  PlayIcon,
  PauseIcon,
  SpeakerHighIcon,
  StopIcon,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassPanel } from "@/components/shared/glass-panel";
import { SceneCanvas } from "@/components/three/canvas-scene";
import { ParticleField, ConfettiBurst } from "@/components/three/particle-field";
import { Envelope, WaxSeal, GiftBox } from "@/components/three/objects";
import { CardMesh3D } from "@/components/three/card-mesh";
import { BookFlipPreview } from "@/components/cards/book-flip-preview";
import { AvatarSvg } from "@/components/wizard/avatar-svg";
import { Waveform } from "@/components/shared/waveform";
import type { AvatarConfig, TextOverlay } from "@/lib/store/wizard-store";
import { markGreetingOpened, addReaction, submitReply, redeemGiftCardFromGreeting } from "@/app/gift/actions";
import { useSpeechReader } from "@/lib/use-speech-reader";
import { cn } from "@/lib/utils";

type Stage = "sealed" | "opening" | "card-rise" | "card-open" | "gift" | "unboxed" | "final";
const REACTIONS = ["❤️", "😍", "🎉", "🙏", "😂"];

interface GiftCardData {
  id: string;
  amount: unknown;
  status: "AVAILABLE" | "SENT" | "REDEEMED";
  redemptionUrl?: string | null;
  brand: { name: string; gradientFrom: string; gradientTo: string };
}

interface UnwrapExperienceProps {
  greetingId: string;
  card: {
    title: string;
    description: string;
    paletteFrom: string;
    paletteTo: string;
    occasionSlug: string;
    coverImageUrl?: string | null;
    contentImageUrl?: string | null;
  };
  senderName: string;
  recipientName: string;
  message: string;
  textOverlays: TextOverlay[];
  avatar: AvatarConfig;
  audioUrl: string | null;
  videoUrl: string | null;
  photoUrls: string[];
  giftCard: GiftCardData | null;
  initialReactions: string[];
  initialReplyMessage: string | null;
}

export function UnwrapExperience({
  greetingId,
  card,
  senderName,
  recipientName,
  message,
  textOverlays,
  avatar,
  audioUrl,
  videoUrl,
  photoUrls,
  giftCard,
  initialReactions,
  initialReplyMessage,
}: UnwrapExperienceProps) {
  const router = useRouter();
  const [stage, setStage] = React.useState<Stage>("sealed");
  const [bookOpen, setBookOpen] = React.useState(false);
  const [pastCardOpen, setPastCardOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [confettiTrigger, setConfettiTrigger] = React.useState(0);
  const [reaction, setReaction] = React.useState<string | null>(initialReactions.at(-1) ?? null);
  const [showReplyBox, setShowReplyBox] = React.useState(false);
  const [replyText, setReplyText] = React.useState(initialReplyMessage ?? "");
  const [replySent, setReplySent] = React.useState(!!initialReplyMessage);
  const [replySubmitting, setReplySubmitting] = React.useState(false);
  const [redeeming, setRedeeming] = React.useState(false);
  const [redeemed, setRedeemed] = React.useState(giftCard?.status === "REDEEMED");
  const [audioPlaying, setAudioPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const reader = useSpeechReader(card.description);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) audioRef.current.pause();
    else audioRef.current.play();
  };

  const hasGift = !!giftCard;

  const advance = (next: Stage, delay: number) => {
    setTimeout(() => setStage(next), delay);
  };

  const startExperience = () => {
    markGreetingOpened(greetingId);
    advance("opening", 300);
    advance("card-rise", 1900);
    advance("card-open", 3300);
    // Give the cover a moment to register before the book flips open to
    // reveal the content page — this is the recipient's first real look at
    // the card's two pages, so it shouldn't be rushed.
    setTimeout(() => setBookOpen(true), 4200);
    if (hasGift) {
      advance("gift", 6400);
      advance("unboxed", 7800);
      advance("final", 8900);
    } else {
      advance("final", 7000);
    }
  };

  const restartExperience = () => {
    setStage("sealed");
    setBookOpen(false);
    setPastCardOpen(false);
    setDetailOpen(false);
    // Give React a beat to unmount the "final" panel before the "sealed"
    // one mounts and immediately kicks the timeline off again.
    setTimeout(startExperience, 50);
  };

  React.useEffect(() => {
    if (stage === "card-open") setPastCardOpen(true);
    if (stage === "final") setConfettiTrigger((t) => t + 1);
  }, [stage]);

  // Once the recipient has moved past the card-open reveal, a small corner
  // thumbnail stays clickable for the rest of the experience so they can
  // look at the card again without replaying the whole animation.
  const docked = pastCardOpen && stage !== "card-open" && stage !== "sealed" && stage !== "opening" && stage !== "card-rise";

  const handleReaction = async (r: string) => {
    setReaction(r);
    await addReaction(greetingId, r);
  };

  const handleReply = async () => {
    setReplySubmitting(true);
    const result = await submitReply(greetingId, replyText);
    setReplySubmitting(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setReplySent(true);
    setShowReplyBox(false);
    toast.success("Reply sent!");
  };

  const handleRedeem = async () => {
    if (!giftCard) return;
    setRedeeming(true);
    const result = await redeemGiftCardFromGreeting(greetingId);
    setRedeeming(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setRedeemed(true);
    toast.success("Gift card redeemed!");
    router.refresh();
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: card.title, url });
        return;
      } catch {
        // user canceled the share sheet — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard.");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="hero-gradient absolute inset-0 -z-20" />
      <div className="absolute inset-0 -z-10">
        <SceneCanvas cameraPosition={[0, 0.4, 7.5]} fov={34}>
          <ParticleField variant="fireflies" count={50} color="#e5b567" />

          <group visible={stage === "sealed" || stage === "opening"}>
            <Envelope scale={1.3} flapOpen={stage === "opening" ? 1 : 0} />
            {stage === "sealed" && <WaxSeal scale={0.65} />}
          </group>

          {/* The 3D mesh only carries the card-rise transition — once "card-open"
              hits, the 2D BookFlipPreview below takes over as the reliable,
              WebGL-independent view of the card's two real pages. */}
          <group visible={stage === "card-rise"}>
            <CardMesh3D from={card.paletteFrom} to={card.paletteTo} coverImageUrl={card.coverImageUrl} contentImageUrl={card.contentImageUrl} scale={0.9} />
          </group>

          <group visible={stage === "gift" || stage === "unboxed"} position={[0, -0.3, 0.6]}>
            <GiftBox
              scale={1.1}
              untied={stage === "unboxed" ? 1 : 0}
              color={giftCard?.brand.gradientFrom ?? "#4338CA"}
              ribbon={giftCard?.brand.gradientTo ?? "#E5B567"}
            />
          </group>

          <ConfettiBurst trigger={confettiTrigger} origin={[0, 1.2, 1]} />
        </SceneCanvas>
      </div>

      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
        <AnimatePresence mode="wait">
          {stage === "sealed" && (
            <motion.div key="sealed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
              <p className="text-sm text-muted-foreground">{senderName} sent you something</p>
              <Button size="lg" onClick={startExperience} className="h-14 cursor-pointer gap-2 rounded-full px-8 text-base shadow-2xl shadow-primary/30">
                <HandPointingIcon size={18} weight="fill" /> Tap to Open
              </Button>
            </motion.div>
          )}

          {stage === "card-open" && (
            <motion.div key="card-open" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-64 flex flex-col items-center gap-5">
              <BookFlipPreview
                title={card.title}
                coverImageUrl={card.coverImageUrl ?? null}
                contentImageUrl={card.contentImageUrl ?? null}
                paletteFrom={card.paletteFrom}
                paletteTo={card.paletteTo}
                overlays={textOverlays}
                open={bookOpen}
                onOpenChange={setBookOpen}
                hideHint
                className="aspect-[4/5] w-56"
              />
              <div className="w-24">
                <AvatarSvg config={avatar} />
              </div>
              <div>
                <p className="font-display text-2xl">{card.title}</p>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{message || card.description}</p>
              </div>
              {videoUrl && (
                <div className="w-full max-w-xs overflow-hidden rounded-2xl shadow-xl">
                  <video src={videoUrl} controls className="w-full" />
                </div>
              )}
              {photoUrls.length > 0 && (
                <div className="grid w-full max-w-sm grid-cols-3 gap-2">
                  {photoUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
                    <img key={url} src={url} alt="" className="aspect-square w-full rounded-lg object-cover shadow-md" />
                  ))}
                </div>
              )}
              {audioUrl ? (
                <button
                  type="button"
                  onClick={toggleAudio}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-muted/60 px-4 py-2 transition-colors hover:bg-muted"
                >
                  {audioPlaying ? <PauseIcon size={15} weight="fill" className="text-electric" /> : <PlayIcon size={15} weight="fill" className="text-electric" />}
                  <Waveform playing={audioPlaying} bars={30} className="h-6" />
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setAudioPlaying(true)}
                    onPause={() => setAudioPlaying(false)}
                    onEnded={() => setAudioPlaying(false)}
                    className="hidden"
                  />
                </button>
              ) : (
                reader.supported && (
                  <button
                    type="button"
                    onClick={reader.toggle}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-muted/60 px-4 py-2 transition-colors hover:bg-muted"
                  >
                    {reader.speaking ? <StopIcon size={15} weight="fill" className="text-electric" /> : <SpeakerHighIcon size={15} weight="fill" className="text-electric" />}
                    <Waveform playing={reader.speaking} bars={30} className="h-6" />
                  </button>
                )
              )}
            </motion.div>
          )}

          {(stage === "gift" || stage === "unboxed") && giftCard && (
            <motion.div key="gift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-80 flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">{stage === "unboxed" ? "A gift for you" : "Unwrapping your gift…"}</p>
              {stage === "unboxed" && (
                <p className="flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 font-medium text-gold">
                  <GiftIcon size={18} weight="fill" /> ${Number(giftCard.amount).toFixed(0)} {giftCard.brand.name}
                </p>
              )}
            </motion.div>
          )}

          {stage === "final" && (
            <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
              <GlassPanel className="flex flex-col items-center gap-5 p-8">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <HandHeartIcon size={26} weight="duotone" />
                </span>
                <div>
                  <h1 className="font-display text-3xl">Happy {card.occasionSlug.replace(/-/g, " ")}{recipientName ? `, ${recipientName}` : ""}!</h1>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{message || card.description}</p>
                </div>

                {giftCard && giftCard.redemptionUrl && !redeemed ? (
                  <Button
                    size="lg"
                    render={<a href={giftCard.redemptionUrl} target="_blank" rel="noopener noreferrer" />}
                    className="h-12 cursor-pointer gap-2 rounded-full px-6 text-base"
                  >
                    <GiftIcon size={17} weight="fill" />
                    Claim ${Number(giftCard.amount).toFixed(0)} {giftCard.brand.name} Gift Card
                  </Button>
                ) : (
                  giftCard && (
                    <Button
                      size="lg"
                      disabled={redeemed || redeeming}
                      onClick={handleRedeem}
                      className="h-12 cursor-pointer gap-2 rounded-full px-6 text-base"
                    >
                      <GiftIcon size={17} weight="fill" />
                      {redeemed
                        ? "Redeemed"
                        : redeeming
                          ? "Redeeming…"
                          : `Redeem $${Number(giftCard.amount).toFixed(0)} ${giftCard.brand.name} Gift Card`}
                    </Button>
                  )
                )}

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {REACTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleReaction(r)}
                      className={cn(
                        "flex size-11 cursor-pointer items-center justify-center rounded-full text-xl transition-transform hover:scale-110",
                        reaction === r ? "bg-primary/15 ring-2 ring-primary scale-110" : "bg-muted",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <div className="grid w-full grid-cols-2 gap-2 border-t border-border/60 pt-5 sm:grid-cols-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={replySent}
                    onClick={() => setShowReplyBox((v) => !v)}
                    className="cursor-pointer gap-1.5 rounded-full text-xs"
                  >
                    <ChatCircleTextIcon size={14} /> {replySent ? "Replied" : "Reply"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={restartExperience} className="cursor-pointer gap-1.5 rounded-full text-xs">
                    <ArrowsClockwiseIcon size={14} /> Replay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<a href={`/gift/${greetingId}/card-image`} download />}
                    className="cursor-pointer gap-1.5 rounded-full text-xs"
                  >
                    <DownloadSimpleIcon size={14} /> Download Card
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<a href={`/gift/${greetingId}/keepsake`} download />}
                    className="cursor-pointer gap-1.5 rounded-full text-xs"
                  >
                    <DownloadSimpleIcon size={14} /> Keepsake
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShare} className="cursor-pointer gap-1.5 rounded-full text-xs">
                    <ShareNetworkIcon size={14} /> Share
                  </Button>
                  <Button render={<Link href="/create" />} variant="outline" size="sm" className="cursor-pointer gap-1.5 rounded-full text-xs">
                    <ArrowUUpLeftIcon size={14} /> Send One Back
                  </Button>
                </div>

                {showReplyBox && !replySent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex w-full flex-col gap-2">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Write a reply to ${senderName}…`}
                      rows={3}
                    />
                    <Button
                      size="sm"
                      disabled={replySubmitting || !replyText.trim()}
                      onClick={handleReply}
                      className="cursor-pointer gap-1.5 self-end rounded-full text-xs"
                    >
                      <PaperPlaneRightIcon size={13} /> {replySubmitting ? "Sending…" : "Send Reply"}
                    </Button>
                  </motion.div>
                )}
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {docked && (
          <motion.button
            type="button"
            onClick={() => setDetailOpen(true)}
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.85 }}
            transition={{ duration: 0.3 }}
            aria-label="View the card in detail"
            className="glass-panel fixed bottom-6 right-4 z-40 aspect-[4/5] w-16 cursor-pointer overflow-hidden rounded-2xl shadow-lg sm:bottom-8 sm:right-8 sm:w-20"
          >
            {card.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static/optimizable asset
              <img src={card.coverImageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
            ) : (
              <div className="flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(135deg, ${card.paletteFrom}, ${card.paletteTo})` }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{card.title}</DialogTitle>
          </DialogHeader>
          <BookFlipPreview
            title={card.title}
            coverImageUrl={card.coverImageUrl ?? null}
            contentImageUrl={card.contentImageUrl ?? null}
            paletteFrom={card.paletteFrom}
            paletteTo={card.paletteTo}
            overlays={textOverlays}
            className="mx-auto aspect-[4/5] w-full max-w-xs"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
