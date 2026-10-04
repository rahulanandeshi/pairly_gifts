import type { Metadata } from "next";
import { PlusIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";
import { campaigns } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Campaigns" };

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-success/15 text-success",
  scheduled: "bg-primary/10 text-primary",
  draft: "bg-muted text-muted-foreground",
};

export default function CampaignsPage() {
  return (
    <DashboardPageShell
      title="Campaigns"
      description="Holiday and milestone campaigns, company-wide."
      nav={BUSINESS_NAV}
      brand="Pairly Business"
      action={<Button className="cursor-pointer gap-1.5 rounded-full"><PlusIcon size={14} weight="bold" /> New Campaign</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {campaigns.map((c) => (
          <GlassPanel key={c.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.occasion}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_STYLES[c.status]}`}>
                {c.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><UsersIcon size={13} /> {c.recipients} recipients</span>
              <span>{c.date}</span>
            </div>
          </GlassPanel>
        ))}
      </div>
    </DashboardPageShell>
  );
}
