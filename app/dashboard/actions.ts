"use server";

import { isGiftCardsEnabled } from "@/lib/site-settings";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, signOut, unstable_update } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";

const profileSchema = z.object({
  name: z.string().trim().min(1),
  bio: z.string().trim().max(280).optional(),
  cultureSlug: z.string().trim().optional(),
});

export async function updateProfile(input: { name: string; bio?: string; cultureSlug?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the form and try again." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      bio: parsed.data.bio || null,
      cultureSlug: parsed.data.cultureSlug || null,
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function becomeCreator() {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "CREATOR" },
  });

  // Re-sign the session cookie with the new role — the proxy's role check on
  // /creator reads the JWT, which otherwise stays stale until next sign-in.
  await unstable_update({ user: { role: "CREATOR" } });

  revalidatePath("/dashboard/settings");
  return { success: true as const };
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
  } catch {
    return {
      error: "This account has cards, orders, or gift cards on file and can't be fully deleted yet — contact support.",
    };
  }

  await signOut({ redirect: false });
  redirect("/");
}

export async function cancelScheduledGreeting(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const greeting = await prisma.sentGreeting.findUnique({ where: { id } });
  if (!greeting || greeting.senderId !== session.user.id) return { error: "Card not found." };
  if (greeting.status !== "SCHEDULED") return { error: "This card is no longer scheduled." };

  await prisma.sentGreeting.delete({ where: { id } });
  revalidatePath("/dashboard/scheduled");
  return { success: true as const };
}

export async function redeemGiftCard(id: string) {
  if (!(await isGiftCardsEnabled())) return { error: "Gift cards aren't available right now." };
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const giftCard = await prisma.giftCardInstance.findUnique({ where: { id } });
  if (!giftCard || giftCard.ownerId !== session.user.id) return { error: "Gift card not found." };
  if (giftCard.status === "REDEEMED") return { error: "This gift card has already been redeemed." };

  await prisma.giftCardInstance.update({
    where: { id },
    data: { status: "REDEEMED", redeemedAt: new Date() },
  });

  revalidatePath("/dashboard/gift-cards");
  return { success: true as const };
}

export async function deleteSavedMessage(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const message = await prisma.savedMessage.findUnique({ where: { id } });
  if (!message || message.userId !== session.user.id) return { error: "Message not found." };

  await prisma.savedMessage.delete({ where: { id } });
  revalidatePath("/dashboard/messages");
  return { success: true as const };
}

export async function markNotificationRead(id: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== session.user.id) return { error: "Notification not found." };

  await prisma.notification.update({ where: { id }, data: { read: true } });
  revalidatePath("/dashboard/notifications");
  return { success: true as const };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  await prisma.notification.updateMany({ where: { userId: session.user.id, read: false }, data: { read: true } });
  revalidatePath("/dashboard/notifications");
  return { success: true as const };
}

export async function createBillingPortalSession() {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { stripeCustomerId: true } });
  if (!user?.stripeCustomerId) return { error: "Subscribe to a plan first to unlock billing management." };

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${SITE_URL}/dashboard/subscription`,
  });

  return { url: portal.url };
}

export async function toggleFavorite(cardId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to save favorites." };

  const existing = await prisma.favorite.findUnique({
    where: { userId_cardId: { userId: session.user.id, cardId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return { success: true as const, favorited: false };
  }

  await prisma.favorite.create({ data: { userId: session.user.id, cardId } });
  return { success: true as const, favorited: true };
}
