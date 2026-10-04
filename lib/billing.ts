import "server-only";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function getSubscription(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId }, include: { plan: true } });
  if (!sub?.stripeSubscriptionId) return sub;

  try {
    const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
    const status = stripeSub.status === "active" || stripeSub.status === "trialing" ? "ACTIVE" : stripeSub.status === "past_due" ? "PAST_DUE" : "CANCELED";
    const currentPeriodEnd = new Date(stripeSub.items.data[0].current_period_end * 1000);

    if (status !== sub.status || currentPeriodEnd.getTime() !== sub.currentPeriodEnd?.getTime()) {
      return prisma.subscription.update({ where: { userId }, data: { status, currentPeriodEnd }, include: { plan: true } });
    }
  } catch {
    // Stripe lookup failed (e.g. subscription no longer exists) — fall back to the last known state.
  }
  return sub;
}
