"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyUser } from "@/lib/notifications";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import { sendEmail } from "@/lib/email";
import { cardOpenedEmail, replyReceivedEmail, reactionReceivedEmail } from "@/lib/email-templates";

export async function markGreetingOpened(id: string) {
  const greeting = await prisma.sentGreeting.findUnique({
    where: { id },
    select: { openedAt: true, senderId: true, recipientName: true, card: { select: { title: true } } },
  });
  if (!greeting || greeting.openedAt) return { success: true as const };

  await prisma.sentGreeting.update({ where: { id }, data: { openedAt: new Date() } });

  await notifyUser({
    userId: greeting.senderId,
    type: "DELIVERY",
    title: "Your card was opened",
    body: `${greeting.recipientName} opened "${greeting.card.title}" — say hi!`,
    email: cardOpenedEmail({ recipientName: greeting.recipientName, cardTitle: greeting.card.title, greetingId: id }),
  });

  return { success: true as const };
}

export async function addReaction(id: string, emoji: string) {
  const allowed = ["❤️", "😍", "🎉", "🙏", "😂"];
  if (!allowed.includes(emoji)) return { error: "Invalid reaction." };

  const greeting = await prisma.sentGreeting.findUnique({
    where: { id },
    select: { reactions: true, senderId: true, recipientName: true, card: { select: { title: true } } },
  });
  if (!greeting) return { error: "Card not found." };

  await prisma.sentGreeting.update({
    where: { id },
    data: { reactions: [...greeting.reactions, emoji] },
  });

  await notifyUser({
    userId: greeting.senderId,
    type: "DELIVERY",
    title: "Your card got a reaction",
    body: `${greeting.recipientName} reacted ${emoji} to "${greeting.card.title}".`,
    email: reactionReceivedEmail({ recipientName: greeting.recipientName, cardTitle: greeting.card.title, emoji, greetingId: id }),
  });

  return { success: true as const };
}

const replySchema = z.string().trim().min(1).max(2000);

export async function submitReply(id: string, message: string) {
  const parsed = replySchema.safeParse(message);
  if (!parsed.success) return { error: "Write a reply before sending." };

  const greeting = await prisma.sentGreeting.findUnique({
    where: { id },
    select: { senderId: true, recipientName: true, card: { select: { title: true } } },
  });
  if (!greeting) return { error: "Card not found." };

  await prisma.sentGreeting.update({ where: { id }, data: { replyMessage: parsed.data } });

  await notifyUser({
    userId: greeting.senderId,
    type: "DELIVERY",
    title: "You got a reply",
    body: `${greeting.recipientName} replied to "${greeting.card.title}".`,
    link: `/dashboard/cards/${id}`,
    email: replyReceivedEmail({ recipientName: greeting.recipientName, cardTitle: greeting.card.title, replyMessage: parsed.data, greetingId: id }),
  });

  revalidatePath(`/gift/${id}`);
  return { success: true as const };
}

const followUpEmailSchema = z.string().trim().min(1).max(4000);

/** Lets a sender fire off a quick follow-up email to the recipient after seeing their reply. */
export async function sendFollowUpEmail(greetingId: string, message: string) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to send a follow-up." };

  const parsed = followUpEmailSchema.safeParse(message);
  if (!parsed.success) return { error: "Write a message before sending." };

  const greeting = await prisma.sentGreeting.findUnique({
    where: { id: greetingId },
    select: { senderId: true, recipientName: true, recipientEmail: true, card: { select: { title: true } } },
  });
  if (!greeting) return { error: "Card not found." };
  if (greeting.senderId !== session.user.id) return { error: "This card doesn't belong to your account." };

  const senderName = session.user.name || "Someone";
  const { sent } = await sendEmail({
    to: greeting.recipientEmail,
    subject: `${senderName} sent you a follow-up`,
    html: `<p>Hi ${greeting.recipientName},</p><p>${parsed.data.replace(/\n/g, "<br/>")}</p><p>— ${senderName}</p>`,
  });
  if (!sent) return { error: "Couldn't send that email — make sure RESEND_API_KEY is configured." };

  return { success: true as const };
}

// Deliberately no auth requirement: the SentGreeting id is unguessable and
// shared only via the delivery email/SMS link, so possession of the link is
// the authorization — this lets a recipient redeem without ever signing up.
export async function redeemGiftCardFromGreeting(greetingId: string) {
  if (!(await isGiftCardsEnabled())) return { error: "Gift cards aren't available right now." };
  const greeting = await prisma.sentGreeting.findUnique({
    where: { id: greetingId },
    select: { giftCard: { select: { id: true, status: true } } },
  });
  if (!greeting?.giftCard) return { error: "No gift card attached to this card." };
  if (greeting.giftCard.status === "REDEEMED") return { error: "This gift card has already been redeemed." };

  // If the person redeeming happens to be signed in, transfer ownership to
  // them so it shows up in their own dashboard — otherwise it stays with
  // whichever account it was assigned to at send time.
  const session = await auth();

  await prisma.giftCardInstance.update({
    where: { id: greeting.giftCard.id },
    data: {
      status: "REDEEMED",
      redeemedAt: new Date(),
      ...(session?.user ? { ownerId: session.user.id } : {}),
    },
  });

  revalidatePath(`/gift/${greetingId}`);
  return { success: true as const };
}
