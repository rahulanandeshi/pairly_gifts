import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CrownIcon, CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { PricingTable } from "@/components/shared/pricing-table";
import { ManageBillingButton } from "@/components/dashboard/manage-billing-button";
import { auth } from "@/auth";
import { getSubscription } from "@/lib/billing";
import { getPricingPlans } from "@/lib/pricing";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [subscription, plans] = await Promise.all([getSubscription(session.user.id), getPricingPlans()]);

  return (
    <DashboardPageShell title="Subscription" description="Manage your plan and see what's included.">
      {subscription && subscription.status === "ACTIVE" ? (
        <GlassPanel className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <CrownIcon size={22} weight="fill" />
            </span>
            <div>
              <p className="flex items-center gap-2 font-medium">
                {subscription.plan.name} <CheckCircleIcon size={15} weight="fill" className="text-success" />
              </p>
              <p className="text-sm text-muted-foreground">
                Renews {subscription.currentPeriodEnd?.toLocaleDateString() ?? "soon"} · ${Number(subscription.plan.price).toFixed(2)}/
                {subscription.plan.cadence}
              </p>
            </div>
          </div>
          <ManageBillingButton label="Manage Subscription" variant="outline" />
        </GlassPanel>
      ) : (
        <GlassPanel className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-medium">Free plan</p>
            <p className="text-sm text-muted-foreground">Upgrade for unlimited cards, AI messages, and voice.</p>
          </div>
          <Button render={<Link href="#change-plan" />} className="cursor-pointer rounded-full">
            View Plans
          </Button>
        </GlassPanel>
      )}

      <h2 id="change-plan" className="mt-10 mb-5 font-medium">Change Plan</h2>
      <PricingTable plans={plans} />
    </DashboardPageShell>
  );
}
