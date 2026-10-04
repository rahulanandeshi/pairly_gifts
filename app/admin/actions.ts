"use server";

import { z } from "zod";
import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { notifyUser } from "@/lib/notifications";
import { cardApprovedEmail, cardRejectedEmail } from "@/lib/email-templates";
import { listGiftCardProducts } from "@/lib/tremendous";
import { SITE_SETTINGS_TAG, normalizeAvatarSettings, writeSetting } from "@/lib/site-settings";
import { themeConfigSchema, type ThemeConfig } from "@/lib/theme/config";
import type { AvatarSettings } from "@/lib/avatar/styles";
import type { FeatureFlags } from "@/lib/features";

export async function approveCard(cardId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  const card = await prisma.greetingCard.findUnique({ where: { id: cardId }, select: { title: true, creatorId: true, status: true } });
  if (!card) return { error: "Card not found." };
  if (card.status !== "PENDING") return { error: "This card has already been reviewed." };

  await prisma.greetingCard.update({ where: { id: cardId }, data: { status: "APPROVED", rejectionReason: null } });

  if (card.creatorId) {
    await notifyUser({
      userId: card.creatorId,
      type: "SYSTEM",
      title: "Your card was approved!",
      body: `"${card.title}" passed review and is now live in the marketplace.`,
      email: cardApprovedEmail({ cardTitle: card.title }),
    });
  }

  revalidatePath("/admin/approvals");
  return { success: true as const };
}

const rejectSchema = z.string().trim().max(500).optional();

export async function rejectCard(cardId: string, reason?: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  const parsedReason = rejectSchema.safeParse(reason);
  if (!parsedReason.success) return { error: "Reason is too long." };

  const card = await prisma.greetingCard.findUnique({ where: { id: cardId }, select: { title: true, creatorId: true, status: true } });
  if (!card) return { error: "Card not found." };
  if (card.status !== "PENDING") return { error: "This card has already been reviewed." };

  await prisma.greetingCard.update({
    where: { id: cardId },
    data: { status: "REJECTED", rejectionReason: parsedReason.data || null },
  });

  if (card.creatorId) {
    await notifyUser({
      userId: card.creatorId,
      type: "SYSTEM",
      title: "Your card needs changes",
      body: parsedReason.data || `"${card.title}" didn't pass review this time.`,
      email: cardRejectedEmail({ cardTitle: card.title, reason: parsedReason.data || null }),
    });
  }

  revalidatePath("/admin/approvals");
  return { success: true as const };
}

export async function setUserBanned(userId: string, banned: boolean) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };
  if (userId === admin.user.id) return { error: "You can't suspend your own account." };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user) return { error: "User not found." };
  if (user.role === "ADMIN") return { error: "Admins can't be suspended from here." };

  await prisma.user.update({ where: { id: userId }, data: { banned } });
  revalidatePath("/admin/users");
  revalidatePath("/admin/creators");
  return { success: true as const };
}

export async function restoreRejectedCard(cardId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  const card = await prisma.greetingCard.findUnique({ where: { id: cardId }, select: { status: true } });
  if (!card || card.status !== "REJECTED") return { error: "Card not found." };

  await prisma.greetingCard.update({ where: { id: cardId }, data: { status: "PENDING", rejectionReason: null } });
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/approvals");
  return { success: true as const };
}

export async function deleteRejectedCard(cardId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  const card = await prisma.greetingCard.findUnique({ where: { id: cardId }, select: { status: true } });
  if (!card || card.status !== "REJECTED") return { error: "Card not found." };

  await prisma.greetingCard.delete({ where: { id: cardId } });
  revalidatePath("/admin/moderation");
  return { success: true as const };
}

export async function resolveSupportTicket(ticketId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  await prisma.supportTicket.update({ where: { id: ticketId }, data: { status: "RESOLVED" } });
  revalidatePath("/admin/support");
  return { success: true as const };
}

export async function toggleCardFeatured(cardId: string, featured: boolean) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  await prisma.greetingCard.update({ where: { id: cardId }, data: { featured } });
  revalidatePath("/admin/content");
  return { success: true as const };
}

/**
 * Matches the live Tremendous product catalog onto existing GiftBrand rows
 * by name and stores the product id, so checkout can start placing real
 * orders for those brands. No-ops until TREMENDOUS_API_KEY is set.
 */
export async function syncGiftCardCatalog() {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  const products = await listGiftCardProducts();
  if (!products) return { error: "Tremendous isn't configured yet — set TREMENDOUS_API_KEY first." };

  const brands = await prisma.giftBrand.findMany();
  let matched = 0;
  for (const brand of brands) {
    const product = products.find((p) => p.name.toLowerCase() === brand.name.toLowerCase());
    if (product) {
      await prisma.giftBrand.update({ where: { id: brand.id }, data: { tremendousProductId: product.id } });
      matched += 1;
    }
  }

  revalidatePath("/admin/gift-cards");
  return { success: true as const, matched, total: brands.length, available: products.length };
}

// ---------------------------------------------------------------------------
// Site settings — feature flags, theme, avatar config (Admin → Settings /
// Appearance / Avatars). Every save invalidates the cached settings and
// revalidates the whole layout tree so the change shows on the next render.
// ---------------------------------------------------------------------------

function refreshSite() {
  updateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
}

export async function setFeatureFlag(flag: keyof FeatureFlags, enabled: boolean) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };
  if (flag !== "giftCards") return { error: "Unknown feature." };

  await writeSetting("features", { giftCards: enabled });
  refreshSite();
  return { success: true as const };
}

export async function saveThemeConfig(config: ThemeConfig) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };

  const parsed = themeConfigSchema.safeParse(config);
  if (!parsed.success) return { error: "That theme has an invalid value — check the colors and try again." };

  await writeSetting("theme", parsed.data);
  refreshSite();
  return { success: true as const };
}

export async function saveAvatarSettings(settings: AvatarSettings) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admin access required." };
  if (!settings.enabledStyles?.length) return { error: "Enable at least one avatar style." };
  if (!settings.enabledAnimations?.length) return { error: "Enable at least one animation." };

  await writeSetting("avatars", normalizeAvatarSettings(settings));
  refreshSite();
  return { success: true as const };
}
