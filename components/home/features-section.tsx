"use client";

import Link from "next/link";
import { useFeatures } from "@/components/features-provider";
import { motion } from "motion/react";
import {
  CardsIcon,
  UserCircleIcon,
  MicrophoneIcon,
  GiftIcon,
  VideoCameraIcon,
  ImageIcon,
  MagicWandIcon,
  WaveformIcon,
  ClockCountdownIcon,
  UsersFourIcon,
  HandCoinsIcon,
  CursorClickIcon,
  CrownIcon,
  ArrowsClockwiseIcon,
  type IconProps,
} from "@phosphor-icons/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlowCard } from "@/components/ui/spotlight-card";

type Glow = "blue" | "purple" | "green" | "red" | "orange";

const FEATURES: { icon: React.ComponentType<IconProps>; title: string; body: string; href: string; glow: Glow; feature?: "giftCards" }[] = [
  { icon: CardsIcon, title: "Greeting Cards", body: "Hundreds of animated, culturally rich designs.", href: "/cards", glow: "purple" },
  { icon: UserCircleIcon, title: "Animated Avatars", body: "Fully customizable, lip-synced to your voice.", href: "/create/personalize", glow: "blue" },
  { icon: MicrophoneIcon, title: "Voice Messages", body: "Record or clone your voice, in any language.", href: "/send/voice", glow: "green" },
  { icon: GiftIcon, title: "Gift Cards", body: "Amazon, Starbucks, Netflix, and 15+ more brands.", href: "/send/gift", glow: "orange", feature: "giftCards" },
  { icon: VideoCameraIcon, title: "Personal Videos", body: "Attach a video message that plays inside the card.", href: "/send/video", glow: "red" },
  { icon: ImageIcon, title: "Custom Photos", body: "Add your own photos to make it unmistakably yours.", href: "/send/photos", glow: "green" },
  { icon: MagicWandIcon, title: "AI Generated Messages", body: "Heartfelt, funny, or formal — written in seconds.", href: "/create/personalize", glow: "purple" },
  { icon: WaveformIcon, title: "AI Voice", body: "Natural, expressive narration for any message.", href: "/create/extras", glow: "blue" },
  { icon: ClockCountdownIcon, title: "Scheduled Delivery", body: "Send now, or the exact moment it matters.", href: "/create/send", glow: "orange" },
  { icon: UsersFourIcon, title: "Group Greetings", body: "Everyone signs the same card, together.", href: "/create", glow: "purple" },
  { icon: HandCoinsIcon, title: "Gift Redemption", body: "One tap for recipients to redeem their gift.", href: "/dashboard/gift-cards", glow: "orange", feature: "giftCards" },
  { icon: CursorClickIcon, title: "Interactive Cards", body: "Tap, swipe, and unwrap — never just a static image.", href: "/cards", glow: "blue" },
  { icon: CrownIcon, title: "Premium Templates", body: "Exclusive seasonal collections for members.", href: "/cards?type=premium", glow: "orange" },
  { icon: ArrowsClockwiseIcon, title: "Subscription", body: "Unlimited cards, avatars, and AI — one simple plan.", href: "/pricing", glow: "purple" },
];

export function FeaturesSection() {
  const features = useFeatures();
  const visibleFeatures = FEATURES.filter((f) => !f.feature || features[f.feature]);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Everything included"
        title="One platform, every way to celebrate"
        description={`From a simple card to a fully personalized, voice-narrated experience${features.giftCards ? " with a gift attached" : ""}.`}
      />
      <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visibleFeatures.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
          >
            <GlowCard glowColor={f.glow} customSize className="group h-full p-0 transition-transform duration-300 ease-glide hover:-translate-y-1">
              <Link href={f.href} className="flex h-full flex-col gap-3 p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-lavender/15 text-primary transition-transform duration-300 group-hover:scale-110">
                  <f.icon size={19} weight="duotone" />
                </span>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{f.body}</p>
              </Link>
            </GlowCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
