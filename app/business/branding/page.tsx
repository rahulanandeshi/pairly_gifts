import type { Metadata } from "next";
import { ImageIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUSINESS_NAV } from "@/lib/dashboard-nav";

export const metadata: Metadata = { title: "Brand Customization" };

const SWATCHES = ["#4338CA", "#B6822F", "#0E8FE0", "#E04B3A", "#16A34A", "#0B1220"];

export default function BrandingPage() {
  return (
    <DashboardPageShell title="Brand Customization" description="Make company cards feel unmistakably yours." nav={BUSINESS_NAV} brand="Pairly Business">
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel className="p-6">
          <h2 className="font-medium">Logo</h2>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-dashed border-border text-muted-foreground">
              <ImageIcon size={24} />
            </div>
            <Button variant="outline" className="cursor-pointer rounded-full">Upload Logo</Button>
          </div>

          <h2 className="mt-8 font-medium">Brand Color</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {SWATCHES.map((c, i) => (
              <button
                key={c}
                type="button"
                className={`size-10 cursor-pointer rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-105 ${i === 0 ? "ring-2 ring-primary" : ""}`}
                style={{ backgroundColor: c }}
                aria-label={`Brand color ${c}`}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-1.5">
            <Label htmlFor="company-name">Company name</Label>
            <Input id="company-name" defaultValue="Acme Corporation" className="h-10" />
          </div>
          <Button className="mt-5 cursor-pointer rounded-full">Save Branding</Button>
        </GlassPanel>

        <GlassPanel className="flex flex-col items-center justify-center gap-4 p-6">
          <p className="text-sm text-muted-foreground">Live Preview</p>
          <div className="flex aspect-[4/5] w-48 flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary to-lavender p-6 text-center text-white shadow-xl">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-xs font-bold">ACME</div>
            <p className="font-display text-lg">Happy Birthday!</p>
            <p className="text-xs text-white/80">From the whole Acme team</p>
          </div>
        </GlassPanel>
      </div>
    </DashboardPageShell>
  );
}
