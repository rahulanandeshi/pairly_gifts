import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { occasions } from "../lib/mock-data/occasions";
import { cultures } from "../lib/mock-data/cultures";
import { giftBrands } from "../lib/mock-data/gift-brands";
import { pricingPlans } from "../lib/mock-data/pricing";
import { cards } from "../lib/mock-data/cards";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ANIMATION_MAP: Record<string, string> = {
  "Gentle Unfold": "GENTLE_UNFOLD",
  "Confetti Burst": "CONFETTI_BURST",
  "Warm Glow": "WARM_GLOW",
  "Floating Petals": "FLOATING_PETALS",
  "Lantern Rise": "LANTERN_RISE",
};

async function main() {
  console.log("Seeding cultures…");
  for (const c of cultures) {
    await prisma.culture.upsert({
      where: { slug: c.slug },
      create: { slug: c.slug, name: c.name, blurb: c.blurb },
      update: { name: c.name, blurb: c.blurb },
    });
  }

  console.log("Seeding occasions…");
  for (const o of occasions) {
    await prisma.occasion.upsert({
      where: { slug: o.slug },
      create: { slug: o.slug, name: o.name, icon: o.icon, blurb: o.blurb, accent: o.accent },
      update: { name: o.name, icon: o.icon, blurb: o.blurb, accent: o.accent },
    });
  }

  console.log("Seeding gift brands…");
  for (const b of giftBrands) {
    await prisma.giftBrand.upsert({
      where: { id: b.id },
      create: {
        id: b.id,
        name: b.name,
        category: b.category,
        gradientFrom: b.gradientFrom,
        gradientTo: b.gradientTo,
        amounts: b.amounts,
      },
      update: { name: b.name, category: b.category, gradientFrom: b.gradientFrom, gradientTo: b.gradientTo, amounts: b.amounts },
    });
  }

  console.log("Seeding pricing plans…");
  for (const p of pricingPlans) {
    await prisma.pricingPlan.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        name: p.name,
        price: p.price,
        cadence: p.cadence,
        badge: p.badge,
        description: p.description,
        cta: p.cta,
        features: p.features,
      },
      update: {
        name: p.name,
        price: p.price,
        cadence: p.cadence,
        badge: p.badge,
        description: p.description,
        cta: p.cta,
        features: p.features,
      },
    });
  }

  console.log(`Seeding ${cards.length} greeting cards…`);
  for (const c of cards) {
    await prisma.greetingCard.upsert({
      where: { slug: c.slug },
      create: {
        slug: c.slug,
        title: c.title,
        description: c.description,
        occasionSlug: c.occasion,
        cultures: { connect: c.cultures.map((slug) => ({ slug })) },
        tags: c.tags,
        premium: c.premium,
        price: c.price,
        trending: c.trending,
        featured: c.featured,
        aiRecommended: c.aiRecommended,
        isNew: c.isNew,
        rating: c.rating,
        reviewCount: c.reviewCount,
        openSeconds: c.openSeconds,
        paletteFrom: c.paletteFrom,
        paletteTo: c.paletteTo,
        animationStyle: ANIMATION_MAP[c.animationStyle] as never,
      },
      update: {
        title: c.title,
        description: c.description,
        occasionSlug: c.occasion,
        cultures: { set: c.cultures.map((slug) => ({ slug })) },
        tags: c.tags,
        premium: c.premium,
        price: c.price,
        trending: c.trending,
        featured: c.featured,
        aiRecommended: c.aiRecommended,
        isNew: c.isNew,
        rating: c.rating,
        reviewCount: c.reviewCount,
        openSeconds: c.openSeconds,
        paletteFrom: c.paletteFrom,
        paletteTo: c.paletteTo,
        animationStyle: ANIMATION_MAP[c.animationStyle] as never,
      },
    });
  }

  console.log("Seeding quick-send template cards…");
  const QUICK_SEND_TEMPLATES = [
    {
      slug: "quick-send-gift",
      title: "Just a Gift",
      description: "A gift card, sent straight to their inbox — no card required.",
      paletteFrom: "#4338CA",
      paletteTo: "#E5B567",
    },
    {
      slug: "quick-send-voice",
      title: "Just a Voice Note",
      description: "A short voice message, sent straight to their inbox.",
      paletteFrom: "#0EA5A4",
      paletteTo: "#38BDF8",
    },
    {
      slug: "quick-send-video",
      title: "Just a Video",
      description: "A personal video message, sent straight to their inbox.",
      paletteFrom: "#DB2777",
      paletteTo: "#F97316",
    },
    {
      slug: "quick-send-photos",
      title: "Just Some Photos",
      description: "A few photos, sent straight to their inbox.",
      paletteFrom: "#16A34A",
      paletteTo: "#65A30D",
    },
  ];
  for (const t of QUICK_SEND_TEMPLATES) {
    await prisma.greetingCard.upsert({
      where: { slug: t.slug },
      create: {
        slug: t.slug,
        title: t.title,
        description: t.description,
        occasionSlug: "thank-you",
        tags: [],
        premium: false,
        price: 0,
        paletteFrom: t.paletteFrom,
        paletteTo: t.paletteTo,
        animationStyle: "WARM_GLOW",
        status: "APPROVED",
        isQuickSendTemplate: true,
      },
      update: {
        title: t.title,
        description: t.description,
        paletteFrom: t.paletteFrom,
        paletteTo: t.paletteTo,
        isQuickSendTemplate: true,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
