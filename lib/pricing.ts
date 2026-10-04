import "server-only";
import { prisma } from "@/lib/prisma";
import type { PricingPlan } from "@/lib/mock-data/types";

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const rows = await prisma.pricingPlan.findMany({ orderBy: { price: "asc" } });
  return rows.map((r) => ({
    id: r.id as PricingPlan["id"],
    name: r.name,
    price: Number(r.price),
    cadence: r.cadence as PricingPlan["cadence"],
    badge: r.badge ?? undefined,
    description: r.description,
    features: r.features as PricingPlan["features"],
    cta: r.cta,
  }));
}
