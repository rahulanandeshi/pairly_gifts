import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon, GlobeHemisphereWestIcon, SparkleIcon, UsersThreeIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlassPanel } from "@/components/shared/glass-panel";
import { AmbientScene } from "@/components/three/ambient-scene";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  { icon: GlobeHemisphereWestIcon, title: "Representation first", body: "We design with cultural consultants, not stock templates — every detail is intentional." },
  { icon: HeartIcon, title: "Emotion over efficiency", body: "A card should feel like a moment, not a transaction. We slow down for the details that matter." },
  { icon: SparkleIcon, title: "Craft, powered by AI", body: "AI helps you write, speak, and personalize — but the warmth is always yours." },
  { icon: UsersThreeIcon, title: "Built with community", body: "Our creator network spans dozens of cultures and traditions, and keeps growing." },
];

const STATS = [
  { value: "40+", label: "Cultures represented" },
  { value: "1.2M+", label: "Cards sent" },
  { value: "180+", label: "Independent creators" },
  { value: "4.9★", label: "Average rating" },
];

export default function AboutPage() {
  return (
    <div>
      <div className="relative overflow-hidden pb-16 pt-32">
        <div className="hero-gradient absolute inset-0 -z-20" />
        <div className="absolute inset-0 -z-10 opacity-70">
          <AmbientScene variant="soft" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            Our story
          </span>
          <h1 className="mt-6 text-balance font-display text-5xl leading-tight">
            Every family deserves to see <span className="italic text-primary">themselves</span> in a card.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-muted-foreground">
            Pairly started with a simple frustration: greeting card aisles that all looked the same. We set out to build the platform we wished existed — one where representation isn't an add-on, it's the whole point.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <GlassPanel key={s.label} className="p-6 text-center">
              <p className="font-display text-3xl text-primary">{s.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </GlassPanel>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="What we believe" title="Designed with intention, not defaults" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {VALUES.map((v) => (
            <GlassPanel key={v.title} className="flex gap-4 p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <v.icon size={20} weight="duotone" />
              </span>
              <div>
                <h3 className="font-medium">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </div>
            </GlassPanel>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <h2 className="text-balance font-display text-3xl">Want to help us build this?</h2>
        <p className="mt-3 text-muted-foreground">We're always looking for designers, cultural consultants, and engineers who care.</p>
        <Button size="lg" render={<Link href="/careers" />} className="mt-6 h-11 cursor-pointer rounded-full px-6">
          View Careers
        </Button>
      </div>
    </div>
  );
}
