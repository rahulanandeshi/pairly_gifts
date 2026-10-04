"use client";

import { motion } from "motion/react";
import { HeartIcon, UsersThreeIcon, HandshakeIcon, SealCheckIcon } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlassPanel } from "@/components/shared/glass-panel";
import { cultures } from "@/lib/mock-data";

const PILLARS = [
  { icon: UsersThreeIcon, title: "Representation", body: "Every card is designed with real cultures, traditions, and families in mind — not an afterthought." },
  { icon: HeartIcon, title: "Connection", body: "Voice, video, and personal photos make every greeting feel like you're truly there." },
  { icon: HandshakeIcon, title: "Belonging", body: "From same-sex couples to blended families, everyone should see themselves reflected." },
  { icon: SealCheckIcon, title: "Authenticity", body: "Designed with cultural consultants — never generic, never an afterthought." },
];

const SWATCHES = [
  ["#4338CA", "#8F7FF2"],
  ["#B6822F", "#E5B567"],
  ["#0E8FE0", "#4CC9FF"],
  ["#E04B3A", "#FF8A7A"],
  ["#16A34A", "#34D399"],
  ["#8F7FF2", "#0E8FE0"],
  ["#0B1220", "#4338CA"],
  ["#E04B3A", "#B6822F"],
  ["#4338CA", "#E04B3A"],
];

export function RepresentationSection() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-lavender/5 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Made to represent you"
          title="Every family, beautifully represented"
          description="Indian, Black, Asian, Hispanic, Middle Eastern, African, Native American, mixed families, same-sex couples, grandparents, and more — Pairly celebrates who you really are."
        />

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {cultures.map((c, i) => {
            const [from, to] = SWATCHES[i % SWATCHES.length];
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
                className="group relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
                <p className="relative font-display text-lg leading-snug">{c.name}</p>
                <p className="relative mt-2 text-xs leading-relaxed text-white/85">{c.blurb}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <GlassPanel className="flex h-full flex-col gap-3 p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <p.icon size={20} weight="duotone" />
                </span>
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
