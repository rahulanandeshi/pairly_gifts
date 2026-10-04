"use client";

import { motion } from "motion/react";
import { QuotesIcon, StarIcon } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/shared/section-heading";
import { GlassPanel } from "@/components/shared/glass-panel";
import { testimonials } from "@/lib/mock-data";

export function TestimonialsSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Real stories" title="Loved by people who see themselves in it" />
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
          >
            <GlassPanel className="flex h-full flex-col gap-4 p-6">
              <QuotesIcon size={22} weight="fill" className="text-gold/70" />
              <p className="flex-1 text-sm leading-relaxed">{t.quote}</p>
              <div className="flex items-center justify-between border-t border-border/60 pt-4">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <StarIcon key={idx} size={13} weight="fill" />
                  ))}
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
