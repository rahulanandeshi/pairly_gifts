"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SceneCanvas } from "@/components/three/canvas-scene";
import { LazyCanvas } from "@/components/three/lazy-canvas";
import { ParticleField } from "@/components/three/particle-field";
import { FloatingObject } from "@/components/three/floating-object";
import { Lantern, OrigamiBird, SparkleStar } from "@/components/three/objects";

export function FinalCta() {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] px-4 py-20 sm:px-6 lg:px-8">
      <div className="hero-gradient absolute inset-0 -z-20 rounded-[2.5rem]" />
      <div className="absolute inset-0 -z-10">
        <LazyCanvas>
          <SceneCanvas cameraPosition={[0, 0, 7]}>
            <ParticleField variant="fireflies" count={45} color="#e5b567" />
            <FloatingObject position={[-3, 1, -0.5]} scale={0.7}>
              <Lantern />
            </FloatingObject>
            <FloatingObject position={[3, -1, -0.5]} scale={0.6} speed={1.3}>
              <OrigamiBird />
            </FloatingObject>
            <FloatingObject position={[2.4, 1.6, -1]} scale={0.4}>
              <SparkleStar />
            </FloatingObject>
          </SceneCanvas>
        </LazyCanvas>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-xl text-center"
      >
        <h2 className="text-balance font-display text-4xl leading-tight sm:text-5xl">
          Send something that feels like <span className="italic text-primary">you.</span>
        </h2>
        <p className="mt-4 text-balance text-muted-foreground">
          Start free — no credit card required. Your first card takes less than five minutes.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" render={<Link href="/create" />} className="h-12 cursor-pointer rounded-full px-7 text-base shadow-xl shadow-primary/25">
            Create a Card <ArrowRightIcon size={17} weight="bold" />
          </Button>
          <Button size="lg" variant="outline" render={<Link href="/pricing" />} className="h-12 cursor-pointer rounded-full px-7 text-base">
            See Pricing
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
