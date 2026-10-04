import type { Metadata } from "next";
import { BriefcaseIcon, MapPinIcon, ClockIcon, HeartbeatIcon, UmbrellaIcon, AirplaneTiltIcon, PiggyBankIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/shared/glass-panel";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = { title: "Careers" };

const ROLES = [
  { title: "Senior Product Designer", team: "Design", location: "Remote (US)", type: "Full-time" },
  { title: "3D / Motion Engineer", team: "Engineering", location: "Remote", type: "Full-time" },
  { title: "Cultural Consultant, South Asia", team: "Content", location: "Remote", type: "Contract" },
  { title: "Cultural Consultant, West Africa", team: "Content", location: "Remote", type: "Contract" },
  { title: "AI/ML Engineer — Voice", team: "Engineering", location: "Remote (US)", type: "Full-time" },
  { title: "Creator Partnerships Lead", team: "Business", location: "New York, NY", type: "Full-time" },
];

const BENEFITS = [
  { icon: HeartbeatIcon, label: "Full health, dental & vision" },
  { icon: UmbrellaIcon, label: "Unlimited PTO" },
  { icon: AirplaneTiltIcon, label: "Annual team retreat" },
  { icon: PiggyBankIcon, label: "401(k) matching" },
];

export default function CareersPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary/80">Careers</span>
        <h1 className="mt-4 text-balance font-display text-4xl sm:text-5xl">Help us build a more personal internet</h1>
        <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
          We're a small, distributed team obsessed with craft, culture, and getting the small details right.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-4">
        {BENEFITS.map((b) => (
          <GlassPanel key={b.label} className="flex flex-col items-center gap-2 p-5 text-center">
            <b.icon size={20} weight="duotone" className="text-primary" />
            <p className="text-xs text-muted-foreground">{b.label}</p>
          </GlassPanel>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading title="Open positions" align="left" />
        <div className="mt-8 flex flex-col gap-3">
          {ROLES.map((r) => (
            <GlassPanel key={r.title} className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-medium">{r.title}</h3>
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><BriefcaseIcon size={13} /> {r.team}</span>
                  <span className="inline-flex items-center gap-1"><MapPinIcon size={13} /> {r.location}</span>
                  <span className="inline-flex items-center gap-1"><ClockIcon size={13} /> {r.type}</span>
                </div>
              </div>
              <Button
                variant="outline"
                render={<a href="mailto:careers@pairly.com" />}
                className="w-full shrink-0 cursor-pointer rounded-full sm:w-auto"
              >
                Apply
              </Button>
            </GlassPanel>
          ))}
        </div>
      </div>
    </div>
  );
}
