import type { Metadata } from "next";
import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { SectionHeading } from "@/components/shared/section-heading";
import { PricingTable } from "@/components/shared/pricing-table";
import { getPricingPlans } from "@/lib/pricing";

export const metadata: Metadata = { title: "Pricing" };

export default async function PricingPage() {
  const pricingPlans = await getPricingPlans();
  const featureRows = Array.from(new Set(pricingPlans.flatMap((p) => p.features.map((f) => f.label))));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Pricing"
        title="Simple pricing, unlimited heart"
        description="Start free. Upgrade when you're ready for unlimited cards, AI, and voice."
      />
      <div className="mt-14">
        <PricingTable plans={pricingPlans} />
      </div>

      <div className="mt-24">
        <h2 className="text-center font-display text-2xl">Compare plans</h2>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border/60">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="p-4 text-left font-medium text-muted-foreground">Feature</th>
                {pricingPlans.map((p) => (
                  <th key={p.id} className="p-4 text-left font-medium">
                    {p.name}
                    {p.badge && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{p.badge}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureRows.map((label, i) => (
                <tr key={label} className={i % 2 === 0 ? "bg-transparent" : "bg-muted/20"}>
                  <td className="p-4 text-muted-foreground">{label}</td>
                  {pricingPlans.map((p) => {
                    const feature = p.features.find((f) => f.label === label);
                    return (
                      <td key={p.id} className="p-4">
                        {feature?.included ? (
                          <CheckIcon size={16} weight="bold" className="text-success" />
                        ) : (
                          <XIcon size={16} className="text-muted-foreground/40" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
