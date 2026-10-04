import type { Metadata } from "next";
import { EnvelopeIcon, ChatCircleDotsIcon, LifebuoyIcon } from "@phosphor-icons/react/dist/ssr";
import { GlassPanel } from "@/components/shared/glass-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { ContactForm } from "@/components/shared/contact-form";

export const metadata: Metadata = { title: "Contact Support" };

const CHANNELS = [
  { icon: EnvelopeIcon, title: "Email us", body: "support@pairly.com", note: "Typically replies within a few hours" },
  { icon: ChatCircleDotsIcon, title: "Live chat", body: "Available for Premium members", note: "Mon–Fri, 9am–6pm ET" },
  { icon: LifebuoyIcon, title: "Help Center", body: "Browse FAQs & guides", note: "Fastest way to self-serve" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Contact" title="We're here to help" description="Send us a message and we'll get back to you shortly." />

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          {CHANNELS.map((c) => (
            <GlassPanel key={c.title} className="flex gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <c.icon size={19} weight="duotone" />
              </span>
              <div>
                <h3 className="text-sm font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm">{c.body}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{c.note}</p>
              </div>
            </GlassPanel>
          ))}
        </div>

        <GlassPanel className="p-8">
          <ContactForm />
        </GlassPanel>
      </div>
    </div>
  );
}
