import "server-only";

// TODO: No gift-card provider is wired up yet — this is a placeholder.
//
// Every real gift-card API (Tremendous, Giftbit, GIFQ, Tango) gates signup
// behind a work-email address, and none of our accounts currently have one —
// see the "gift card provider" decision for why. This module is a real,
// correctly-shaped integration against Tremendous's documented API (the best
// fit found: free sandbox with $100k test balance, no setup/API fees, 2000+
// real payout methods) — set TREMENDOUS_API_KEY to enable it. Until then,
// every function below no-ops and the app falls back to the local simulated
// GiftBrand catalog. Untested against a live account — verify before relying
// on it. Docs: https://developers.tremendous.com/reference/introduction
//
// Setup: sign up at tremendous.com with a work email, go to Team Settings →
// Developers, generate a Sandbox API key (starts with "TEST_"), and set
// TREMENDOUS_API_KEY. Swap TREMENDOUS_API_BASE to the production URL and use
// a live key when ready to send real gift cards.

const API_BASE = process.env.TREMENDOUS_API_BASE || "https://testflight.tremendous.com/api/v2";

function isConfigured() {
  return !!process.env.TREMENDOUS_API_KEY;
}

async function tremendousFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.TREMENDOUS_API_KEY;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Tremendous API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export interface TremendousProduct {
  id: string;
  name: string;
  category: string;
  minDenomination: number;
  maxDenomination: number;
  denominations: number[];
  imageUrl: string | null;
}

/** Live product catalog (real gift card brands) — null if not configured or the request fails. */
export async function listGiftCardProducts(): Promise<TremendousProduct[] | null> {
  if (!isConfigured()) {
    console.log("[tremendous:not-configured] listGiftCardProducts skipped");
    return null;
  }
  try {
    const data = await tremendousFetch("/products");
    const products = (data?.products ?? []) as Array<{
      id: string;
      name: string;
      category?: string;
      denominations?: number[];
      skus?: { min?: number; max?: number }[];
      images?: { src: string }[];
    }>;
    return products
      .filter((p) => p.category === "giftcard" || p.category === "merchant_card")
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category ?? "giftcard",
        minDenomination: p.skus?.[0]?.min ?? p.denominations?.[0] ?? 5,
        maxDenomination: p.skus?.[0]?.max ?? p.denominations?.at(-1) ?? 200,
        denominations: p.denominations ?? [],
        imageUrl: p.images?.[0]?.src ?? null,
      }));
  } catch (err) {
    console.error("[tremendous] listGiftCardProducts failed", err);
    return null;
  }
}

export interface CreateGiftCardOrderInput {
  productId: string;
  amount: number;
  recipientName: string;
  recipientEmail: string;
  externalId: string;
}

export type CreateGiftCardOrderResult =
  | { placed: false }
  | { placed: true; orderId: string; rewardId: string; redemptionUrl: string };

/**
 * Places a real order for a single gift card, delivered as a one-time claim
 * link (not emailed by Tremendous directly) so it can be handed off through
 * our own branded delivery email/SMS instead.
 */
export async function createGiftCardOrder(input: CreateGiftCardOrderInput): Promise<CreateGiftCardOrderResult> {
  if (!isConfigured()) {
    console.log(`[tremendous:not-configured] createGiftCardOrder skipped for ${input.productId} $${input.amount}`);
    return { placed: false };
  }
  try {
    const data = await tremendousFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        external_id: input.externalId,
        payment: { funding_source_id: "balance" },
        reward: {
          value: { denomination: input.amount, currency_code: "USD" },
          delivery: { method: "LINK" },
          recipient: { name: input.recipientName, email: input.recipientEmail },
          products: [input.productId],
        },
      }),
    });
    const reward = data?.order?.rewards?.[0];
    const redemptionUrl = reward?.delivery?.link as string | undefined;
    if (!reward?.id || !redemptionUrl) return { placed: false };
    return { placed: true, orderId: data.order.id, rewardId: reward.id, redemptionUrl };
  } catch (err) {
    console.error("[tremendous] createGiftCardOrder failed", err);
    return { placed: false };
  }
}
