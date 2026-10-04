"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/shared/glass-panel";
import type { PricingPlan } from "@/lib/mock-data";
import { createSubscriptionCheckoutSession } from "@/app/create/actions";
import { useFeatures } from "@/components/features-provider";
import { cn } from "@/lib/utils";

export function PricingTable({ plans }: { plans: PricingPlan[] }) {
  const router = useRouter();
  const [subscribingId, setSubscribingId] = React.useState<string | null>(null);
  const { giftCards } = useFeatures();

  const handleSubscribe = async (planId: "premium-monthly" | "premium-annual") => {
    setSubscribingId(planId);
    const result = await createSubscriptionCheckoutSession(planId, "/dashboard/subscription");
    if (result.error || !result.url) {
      setSubscribingId(null);
      if (result.error?.includes("Sign in")) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent("/pricing")}`);
        return;
      }
      toast.error(result.error ?? "Something went wrong.");
      return;
    }
    window.location.href = result.url;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan, i) => {
        const highlighted = plan.id === "premium-annual";
        return (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <GlassPanel
              className={cn(
                "relative flex h-full flex-col gap-6 p-8",
                highlighted && "ring-2 ring-primary shadow-2xl shadow-primary/20",
              )}
            >
              {plan.badge && (
                <span
                  className={cn(
                    "absolute -top-3 left-8 rounded-full px-3 py-1 text-xs font-semibold",
                    highlighted ? "bg-primary text-primary-foreground" : "bg-gold text-background",
                  )}
                >
                  {plan.badge}
                </span>
              )}
              <div>
                <h3 className="font-display text-2xl">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-4xl">${plan.price}</span>
                {plan.cadence !== "forever" && <span className="text-sm text-muted-foreground">/{plan.cadence}</span>}
              </div>
              {plan.id === "free" ? (
                <Button size="lg" variant="outline" render={<Link href="/auth/sign-up" />} className="h-11 cursor-pointer rounded-full">
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant={highlighted ? "default" : "outline"}
                  disabled={subscribingId === plan.id}
                  onClick={() => handleSubscribe(plan.id as "premium-monthly" | "premium-annual")}
                  className="h-11 cursor-pointer rounded-full"
                >
                  {subscribingId === plan.id ? "Redirecting…" : plan.cta}
                </Button>
              )}
              <ul className="flex flex-1 flex-col gap-3 border-t border-border/60 pt-6">
                {plan.features.filter((f) => giftCards || !/gift/i.test(f.label)).map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <CheckIcon size={16} weight="bold" className="mt-0.5 shrink-0 text-success" />
                    ) : (
                      <XIcon size={16} className="mt-0.5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className={cn(!f.included && "text-muted-foreground/60 line-through")}>{f.label}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </motion.div>
        );
      })}
    </div>
  );
}
