"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { redeemGiftCard } from "@/app/dashboard/actions";

interface GiftCardRow {
  id: string;
  amount: unknown; // Prisma Decimal, stringified for display
  status: "AVAILABLE" | "SENT" | "REDEEMED";
  purchasedAt: Date;
  redemptionUrl?: string | null;
  brand: { name: string; gradientFrom: string; gradientTo: string };
}

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-success/15 text-success",
  REDEEMED: "bg-muted text-muted-foreground",
  SENT: "bg-primary/10 text-primary",
};

export function GiftCardsGrid({ giftCards }: { giftCards: GiftCardRow[] }) {
  const router = useRouter();
  const [redeemingId, setRedeemingId] = React.useState<string | null>(null);

  const handleRedeem = async (id: string) => {
    setRedeemingId(id);
    const result = await redeemGiftCard(id);
    setRedeemingId(null);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Gift card redeemed.");
    router.refresh();
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {giftCards.map((gc) => (
        <GlassPanel key={gc.id} className="overflow-hidden p-0">
          <div
            className="flex h-28 flex-col justify-between p-4 text-white"
            style={{ background: `linear-gradient(135deg, ${gc.brand.gradientFrom}, ${gc.brand.gradientTo})` }}
          >
            <span className="text-sm font-semibold">{gc.brand.name}</span>
            <span className="font-display text-2xl">${Number(gc.amount).toFixed(0)}</span>
          </div>
          <div className="flex items-center justify-between p-4">
            <div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[gc.status]}`}>
                {gc.status.toLowerCase()}
              </span>
              <p className="mt-1.5 text-xs text-muted-foreground">{gc.purchasedAt.toLocaleDateString()}</p>
            </div>
            {gc.status !== "REDEEMED" &&
              (gc.redemptionUrl ? (
                <Button size="sm" render={<a href={gc.redemptionUrl} target="_blank" rel="noopener noreferrer" />} className="cursor-pointer gap-1 rounded-full text-xs">
                  Claim <ArrowSquareOutIcon size={12} weight="bold" />
                </Button>
              ) : (
                gc.status === "AVAILABLE" && (
                  <Button
                    size="sm"
                    disabled={redeemingId === gc.id}
                    onClick={() => handleRedeem(gc.id)}
                    className="cursor-pointer rounded-full text-xs"
                  >
                    {redeemingId === gc.id ? "Redeeming…" : "Redeem"}
                  </Button>
                )
              ))}
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}
