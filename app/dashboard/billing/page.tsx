import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCardIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { ManageBillingButton } from "@/components/dashboard/manage-billing-button";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { stripeCustomerId: true } });

  return (
    <DashboardPageShell title="Billing" description="Manage payment methods and billing details.">
      <GlassPanel className="p-6">
        <h2 className="font-medium">Payment Methods</h2>
        {user.stripeCustomerId ? (
          <>
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border p-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCardIcon size={18} weight="duotone" />
              </span>
              <p className="text-sm text-muted-foreground">
                Managed securely through Stripe. Add, remove, or update your card from the billing portal.
              </p>
            </div>
            <ManageBillingButton label="Manage Billing & Payment Methods" variant="outline" className="mt-4" />
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No payment method on file yet — subscribing to a paid plan will add one automatically.{" "}
            <Link href="/dashboard/subscription" className="font-medium text-primary hover:underline">
              View plans
            </Link>
          </p>
        )}
      </GlassPanel>

      <GlassPanel className="mt-6 flex items-center justify-between p-6">
        <div>
          <h2 className="font-medium">Billing History</h2>
          <p className="text-sm text-muted-foreground">View invoices and past charges.</p>
        </div>
        <Button variant="outline" render={<Link href="/dashboard/purchases" />} className="cursor-pointer gap-1.5 rounded-full">
          View History <ArrowRightIcon size={14} weight="bold" />
        </Button>
      </GlassPanel>
    </DashboardPageShell>
  );
}
