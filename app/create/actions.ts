"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/site";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { notifyUser } from "@/lib/notifications";
import { cardDeliveredEmail, paymentSuccessEmail } from "@/lib/email-templates";
import { generateCultureArt, generateFamilyIllustration } from "@/lib/image-gen";
import { getPlaybackUrl } from "@/lib/s3";
import { createGiftCardOrder, type CreateGiftCardOrderResult } from "@/lib/tremendous";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import type { AvatarConfig } from "@/lib/store/wizard-store";

async function computeTotal(cardId: string, giftAmount: number | null) {
  const card = await prisma.greetingCard.findUniqueOrThrow({ where: { id: cardId } });
  const cardPrice = card.premium ? Number(card.price) : 0;
  const giftPrice = giftAmount && giftAmount > 0 ? giftAmount : 0;
  const subtotal = cardPrice + giftPrice;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { card, cardPrice, giftPrice, subtotal, tax, total, totalCents: Math.round(total * 100) };
}

export async function createPaymentIntent(input: { cardId: string; giftAmount: number | null }) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to complete your order." };

  // Server-side guard: a stale client (or crafted request) can't price a gift while gift cards are off.
  const giftAmount = (await isGiftCardsEnabled()) ? input.giftAmount : null;
  const { total, totalCents } = await computeTotal(input.cardId, giftAmount);
  if (totalCents <= 0) return { error: "Nothing to charge." };

  const intent = await stripe.paymentIntents.create({
    amount: totalCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: { userId: session.user.id, cardId: input.cardId },
  });

  return { clientSecret: intent.client_secret!, total };
}

const finalizeSchema = z.object({
  cardId: z.string(),
  avatar: z.object({
    kind: z.enum(["avatar", "illustration"]),
    imageUrl: z.string(),
    glbUrl: z.string().optional(),
    style: z.string().optional(),
    animation: z.string().optional(),
  }),
  recipientName: z.string().trim().min(1),
  recipientEmail: z.string().trim().email(),
  recipientPhone: z.string().trim().optional(),
  deliveryChannel: z.enum(["email", "sms", "link"]).default("email"),
  message: z.string().trim().min(1),
  textOverlays: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
        x: z.number(),
        y: z.number(),
        fontSize: z.number(),
        color: z.string(),
      }),
    )
    .optional(),
  audioUrl: z.string().nullable().optional(),
  photoUrls: z.array(z.string()).optional(),
  videoUrl: z.string().nullable().optional(),
  giftBrandId: z.string().nullable(),
  giftAmount: z.number().nullable(),
  deliveryMode: z.enum(["now", "schedule"]),
  scheduleAt: z.string().nullable(),
  paymentIntentId: z.string().optional(),
});

export type FinalizeOrderInput = z.infer<typeof finalizeSchema>;

export async function finalizeOrder(input: FinalizeOrderInput) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to complete your order." };

  const parsed = finalizeSchema.safeParse(input);
  if (!parsed.success) return { error: "Please complete all required fields." };
  const data = parsed.data;
  if (!(await isGiftCardsEnabled())) {
    data.giftBrandId = null;
    data.giftAmount = null;
  }

  const { card, cardPrice, giftPrice, subtotal, tax, total } = await computeTotal(data.cardId, data.giftAmount);

  if (total > 0) {
    if (!data.paymentIntentId) return { error: "Payment is required to complete this order." };
    const intent = await stripe.paymentIntents.retrieve(data.paymentIntentId);
    if (intent.status !== "succeeded") return { error: "Payment has not completed yet." };
    if (intent.metadata.userId !== session.user.id) return { error: "This payment doesn't belong to your account." };
    if (intent.amount !== Math.round(total * 100)) return { error: "Payment amount doesn't match the order total." };
  }

  const giftBrand = data.giftBrandId ? await prisma.giftBrand.findUnique({ where: { id: data.giftBrandId } }) : null;
  if (data.giftBrandId && !giftBrand) return { error: "Selected gift card brand is no longer available." };

  // Only brands synced from a live Tremendous catalog carry a product id —
  // everything else stays on the simulated local flow. Placed outside the
  // transaction below since it's a real external order, not something to
  // risk rolling back after the fact.
  let tremendousOrder: CreateGiftCardOrderResult | null = null;
  if (giftBrand?.tremendousProductId && data.giftAmount) {
    tremendousOrder = await createGiftCardOrder({
      productId: giftBrand.tremendousProductId,
      amount: data.giftAmount,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail.toLowerCase(),
      externalId: `${session.user.id}-${Date.now()}`,
    });
  }

  const recipientUser = await prisma.user.findUnique({
    where: { email: data.recipientEmail.toLowerCase() },
    select: { id: true },
  });

  const sentGreetingId = await prisma.$transaction(async (tx) => {
    const greeting = await tx.sentGreeting.create({
      data: {
        senderId: session.user.id,
        cardId: card.id,
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail.toLowerCase(),
        recipientPhone: data.recipientPhone || null,
        deliveryChannel: data.deliveryChannel.toUpperCase() as "EMAIL" | "SMS" | "LINK",
        recipientId: recipientUser?.id ?? null,
        message: data.message,
        textOverlays: data.textOverlays ?? [],
        audioUrl: data.audioUrl || null,
        photoUrls: data.photoUrls ?? [],
        videoUrl: data.videoUrl || null,
        avatar: data.avatar satisfies AvatarConfig,
        status: data.deliveryMode === "now" ? "DELIVERED" : "SCHEDULED",
        scheduledFor: data.scheduleAt ? new Date(data.scheduleAt) : null,
        sentAt: data.deliveryMode === "now" ? new Date() : null,
      },
    });

    if (data.giftBrandId && data.giftAmount) {
      await tx.giftCardInstance.create({
        data: {
          brandId: data.giftBrandId,
          amount: data.giftAmount,
          // Ownership goes to the recipient if they have an account (so they can
          // redeem it themselves) — falls back to the sender if the recipient
          // hasn't signed up yet, since there's no claim-by-email flow.
          ownerId: recipientUser?.id ?? session.user.id,
          status: recipientUser ? "AVAILABLE" : "SENT",
          sentGreetingId: greeting.id,
          tremendousOrderId: tremendousOrder?.placed ? tremendousOrder.orderId : null,
          tremendousRewardId: tremendousOrder?.placed ? tremendousOrder.rewardId : null,
          redemptionUrl: tremendousOrder?.placed ? tremendousOrder.redemptionUrl : null,
        },
      });
    }

    const order = await tx.order.create({
      data: {
        userId: session.user.id,
        stripePaymentIntentId: data.paymentIntentId ?? null,
        subtotal,
        tax,
        total,
        status: "PAID",
      },
    });

    await tx.orderItem.create({
      data: {
        orderId: order.id,
        type: "CARD",
        description: card.title,
        amount: cardPrice,
        refId: card.id,
      },
    });

    if (giftBrand && giftPrice > 0) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          type: "GIFT_CARD",
          description: `${giftBrand.name} gift card`,
          amount: giftPrice,
          refId: giftBrand.id,
        },
      });
    }

    await tx.greetingCard.update({ where: { id: card.id }, data: { downloads: { increment: 1 } } });

    return greeting.id;
  });

  if (total > 0) {
    await notifyUser({
      userId: session.user.id,
      type: "BILLING",
      title: "Payment successful",
      body: `Your $${total.toFixed(2)} payment for "${card.title}" went through.`,
      email: paymentSuccessEmail({ cardTitle: card.title, total, greetingId: sentGreetingId }),
    });
  }

  if (data.deliveryMode === "now") {
    const senderName = session.user.name || "Someone";
    if (data.deliveryChannel === "email") {
      const { subject, html } = cardDeliveredEmail({
        recipientName: data.recipientName,
        senderName,
        cardTitle: card.title,
        message: data.message,
        greetingId: sentGreetingId,
      });
      await sendEmail({ to: data.recipientEmail, subject, html });
    } else if (data.deliveryChannel === "sms" && data.recipientPhone) {
      await sendSms(data.recipientPhone, `${senderName} sent you "${card.title}" on Pairly! Open it: ${SITE_URL}/gift/${sentGreetingId}`);
    }
    // "link" channel: nothing sent automatically — sender shares the link themselves.
  }

  return { success: true as const, sentGreetingId };
}

export async function createSubscriptionCheckoutSession(
  planId: "premium-monthly" | "premium-annual" = "premium-monthly",
  returnPath = "/create/send",
) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to subscribe." };

  const plan = await prisma.pricingPlan.findUniqueOrThrow({ where: { id: planId } });
  let priceId = plan.stripePriceId;

  if (!priceId) {
    const product = await stripe.products.create({ name: plan.name });
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(Number(plan.price) * 100),
      currency: "usd",
      recurring: { interval: plan.cadence === "year" ? "year" : "month" },
    });
    priceId = price.id;
    await prisma.pricingPlan.update({ where: { id: planId }, data: { stripePriceId: priceId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${SITE_URL}${returnPath}?subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}${returnPath}`,
    customer_email: session.user.email ?? undefined,
    metadata: { userId: session.user.id },
  });

  if (!checkoutSession.url) return { error: "Could not start checkout." };
  return { url: checkoutSession.url };
}

export async function confirmSubscription(checkoutSessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to continue." };

  const checkoutSession = await stripe.checkout.sessions.retrieve(checkoutSessionId, { expand: ["subscription"] });
  if (checkoutSession.metadata?.userId !== session.user.id) return { error: "This checkout session doesn't belong to your account." };
  if (checkoutSession.payment_status !== "paid") return { error: "Subscription payment hasn't completed yet." };

  const subscription = checkoutSession.subscription;
  if (!subscription || typeof subscription === "string") return { error: "Subscription details unavailable." };

  const customerId = typeof checkoutSession.customer === "string" ? checkoutSession.customer : checkoutSession.customer?.id;
  if (customerId) {
    await prisma.user.update({ where: { id: session.user.id }, data: { stripeCustomerId: customerId } });
  }

  const priceId = subscription.items.data[0].price.id;
  const plan = await prisma.pricingPlan.findFirst({ where: { stripePriceId: priceId } });
  const planId = plan?.id ?? "premium-monthly";

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      planId,
      stripeSubscriptionId: subscription.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
    },
    update: {
      planId,
      stripeSubscriptionId: subscription.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
    },
  });

  return { success: true as const };
}

export async function generateCultureArtwork(cultureName: string) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to generate custom artwork." };

  const trimmed = cultureName.trim();
  if (!trimmed) return { error: "Tell us which culture to design for first." };

  const result = await generateCultureArt(
    `Elegant, warm, premium greeting-card cover art celebrating ${trimmed} culture and traditions — soft gradient, no text.`,
  );

  if (!result.generated) {
    return { error: "AI art generation isn't connected yet — we'll use a warm default look for now." };
  }

  return { success: true as const, url: result.url };
}

export async function generateFamilyIllustrationArt(input: { description?: string; referencePhotoKey?: string; style: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to generate an illustration." };
  if (!input.description?.trim() && !input.referencePhotoKey) {
    return { error: "Add a description or upload a photo first." };
  }

  const referencePhotoUrl = input.referencePhotoKey ? await getPlaybackUrl(input.referencePhotoKey) : undefined;
  const result = await generateFamilyIllustration({ description: input.description, referencePhotoUrl, style: input.style });

  if (!result.generated) {
    return { error: "AI illustration generation isn't connected yet — try Build an Avatar instead." };
  }

  return { success: true as const, url: result.url };
}
