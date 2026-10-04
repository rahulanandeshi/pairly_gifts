import type { Metadata } from "next";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  CreditCardIcon,
  SparkleIcon,
  GiftIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChatCircleDotsIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/shared/glass-panel";
import { SectionHeading } from "@/components/shared/section-heading";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { isGiftCardsEnabled } from "@/lib/site-settings";

export const metadata: Metadata = { title: "Help Center" };

const TOPICS: { icon: typeof GiftIcon; title: string; body: string; gift?: boolean }[] = [
  { icon: CreditCardIcon, title: "Billing & Subscriptions", body: "Plans, payments, and refunds." },
  { icon: SparkleIcon, title: "Creating a Card", body: "Wizard, avatars, AI messages, and audio." },
  { icon: GiftIcon, title: "Gift Cards", body: "Redeeming and sending gift cards.", gift: true },
  { icon: UserCircleIcon, title: "Account & Settings", body: "Profile, notifications, and privacy." },
  { icon: ShieldCheckIcon, title: "Trust & Safety", body: "Content moderation and reporting." },
  { icon: ChatCircleDotsIcon, title: "Delivery & Recipients", body: "Scheduling and tracking a card." },
];

const FAQS: { q: string; a: string; gift?: boolean }[] = [
  { q: "How long does a card take to arrive?", a: "Digital cards are delivered instantly, or at the exact time you schedule. Email and SMS delivery typically arrive within seconds." },
  { q: "Can I edit a card after sending it?", a: "Once a card has been delivered, it can no longer be edited. You can always send a follow-up card or a reply." },
  { q: "How do gift cards get redeemed?", a: "Recipients tap 'Redeem' inside the card experience and are guided through claiming their gift card with the issuing brand.", gift: true },
  { q: "What happens if I cancel my subscription?", a: "You'll keep Premium access until the end of your billing period, then automatically move to the Free plan." },
  { q: "Is my voice recording stored securely?", a: "Yes — voice and video uploads are encrypted and only accessible to you and your card's recipient." },
];

export default async function HelpCenterPage() {
  const giftCards = await isGiftCardsEnabled();
  const topics = TOPICS.filter((t) => giftCards || !t.gift);
  const faqs = FAQS.filter((f) => giftCards || !f.gift);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary/80">Help Center</span>
        <h1 className="mt-4 text-balance font-display text-4xl sm:text-5xl">How can we help?</h1>
        <div className="relative mx-auto mt-8 max-w-lg">
          <MagnifyingGlassIcon size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles…" className="h-12 rounded-full pl-11" />
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <GlassPanel key={t.title} className="flex gap-3 p-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <t.icon size={18} weight="duotone" />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{t.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.body}</p>
            </div>
          </GlassPanel>
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading title="Frequently asked questions" align="left" />
        <GlassPanel className="mt-8 p-6">
          <Accordion>
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger>{f.q}</AccordionTrigger>
                <AccordionContent>{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </GlassPanel>
      </div>

      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <p className="text-muted-foreground">Still need help?</p>
        <Button render={<Link href="/contact" />} size="lg" className="h-11 cursor-pointer rounded-full px-6">
          Contact Support
        </Button>
      </div>
    </div>
  );
}
