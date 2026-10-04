import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import { QuickSendForm, type QuickSendType } from "@/components/send/quick-send-form";

const TYPES: Record<QuickSendType, { title: string; description: string }> = {
  gift: { title: "Send a Gift Card", description: "Pick a brand and amount — delivered straight to their inbox, no card required." },
  voice: { title: "Send a Voice Note", description: "Record or upload a short voice message and send it in seconds." },
  video: { title: "Send a Video", description: "Share a short personal video message." },
  photos: { title: "Send Photos", description: "Share a few photos with a short note." },
};

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type } = await params;
  const meta = TYPES[type as QuickSendType];
  return { title: meta?.title ?? "Quick Send" };
}

export default async function QuickSendPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!(type in TYPES)) notFound();
  const quickSendType = type as QuickSendType;
  if (quickSendType === "gift" && !(await isGiftCardsEnabled())) notFound();

  const session = await auth();
  if (!session?.user) redirect(`/auth/login?callbackUrl=/send/${quickSendType}`);

  const card = await prisma.greetingCard.findUnique({
    where: { slug: `quick-send-${quickSendType}` },
    select: { id: true },
  });
  if (!card) notFound();

  const meta = TYPES[quickSendType];

  return (
    <div className="relative min-h-screen">
      <div className="hero-gradient absolute inset-0 -z-20" />
      <div className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
        <h1 className="text-balance font-display text-3xl sm:text-4xl">{meta.title}</h1>
        <p className="mt-2 text-muted-foreground">{meta.description}</p>
        <div className="mt-8">
          <QuickSendForm type={quickSendType} cardId={card.id} />
        </div>
      </div>
    </div>
  );
}
