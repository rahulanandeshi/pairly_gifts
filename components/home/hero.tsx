"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRightIcon, PlayCircleIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ScrollScrubVideo } from "@/components/home/scroll-scrub-video";

// Matches the frame count extracted from assets/1.1-invideo-seedance_2_0.mp4
// (97 frames @ 24fps, ~4s) into /public/hero-frames.
const HERO_FRAME_COUNT = 97;

const FADE_UP = "animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-1000 ease-glide";
const FADE_DELAYS = ["delay-150", "delay-300", "delay-[500ms]", "delay-[700ms]"];

export function Hero() {
  return (
    <ScrollScrubVideo
      framesPath="/hero-frames"
      frameCount={HERO_FRAME_COUNT}
      className="relative"
      fallback={
        <div className="relative flex min-h-[105vh] items-center overflow-hidden pt-16">
          <div className="hero-gradient absolute inset-0 -z-20" />
          <HeroContent />
        </div>
      }
    >
      <div className="hero-gradient absolute inset-0 -z-20" />
      <div className="relative flex h-full items-center pt-16">
        <HeroContent />
      </div>
    </ScrollScrubVideo>
  );
}

function HeroContent() {
  return (
    <>
      {/* Legibility scrim — guarantees text contrast against whatever the video frame looks like underneath. */}
      <div
        className="pointer-events-none absolute inset-0 -z-[5] backdrop-blur-[2px]"
        style={{
          background: `linear-gradient(
            to bottom,
            color-mix(in oklab, var(--background) 10%, transparent) 0%,
            color-mix(in oklab, var(--background) 55%, transparent) 20%,
            color-mix(in oklab, var(--background) 80%, transparent) 38%,
            color-mix(in oklab, var(--background) 80%, transparent) 66%,
            color-mix(in oklab, var(--background) 45%, transparent) 84%,
            color-mix(in oklab, var(--background) 10%, transparent) 100%
          )`,
        }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span
          className={cn(
            FADE_UP,
            FADE_DELAYS[0],
            "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/40 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur",
          )}
        >
          <span className="size-1.5 rounded-full bg-gold" />
          AI-crafted greetings, made for every culture
        </span>

        <h1
          className={cn(
            FADE_UP,
            FADE_DELAYS[1],
            "mt-6 text-balance font-display text-4xl font-normal leading-[1.08] sm:text-6xl md:text-7xl",
          )}
        >
          Every Celebration Deserves to <span className="italic text-primary">Feel Personal.</span>
        </h1>

        <p
          className={cn(
            FADE_UP,
            FADE_DELAYS[2],
            "mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground",
          )}
        >
          Create beautiful greeting cards featuring people, traditions, and cultures that truly represent your loved ones.
        </p>

        <div
          className={cn(FADE_UP, FADE_DELAYS[3], "mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row")}
        >
          <Button
            size="lg"
            render={<Link href="/create" />}
            className="h-12 cursor-pointer rounded-full px-7 text-base shadow-xl shadow-primary/25 sheen-hover"
          >
            Create a Card <ArrowRightIcon size={17} weight="bold" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            render={<Link href="/cards" />}
            className="h-12 cursor-pointer rounded-full px-7 text-base"
          >
            <PlayCircleIcon size={18} weight="duotone" /> Explore Cards
          </Button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </>
  );
}
