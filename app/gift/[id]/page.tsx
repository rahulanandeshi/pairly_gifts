import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnwrapExperience } from "@/components/gift/unwrap-experience";
import { getSentGreetingById } from "@/lib/gift";
import { isGiftCardsEnabled } from "@/lib/site-settings";
import { getPlaybackUrl } from "@/lib/s3";
import { DEFAULT_AVATAR } from "@/components/wizard/avatar-options";
import type { AvatarConfig, TextOverlay } from "@/lib/store/wizard-store";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const greeting = await getSentGreetingById(id);
  return { title: greeting ? `A gift from ${greeting.sender.name ?? "someone special"}` : "Open your card" };
}

export default async function GiftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const greeting = await getSentGreetingById(id);
  if (!greeting) notFound();
  // Gift cards off: the recipient just gets the card — the gift reveal and redeem flow are skipped.
  const giftCardsOn = await isGiftCardsEnabled();

  const [audioPlaybackUrl, coverImageUrl, contentImageUrl, videoPlaybackUrl, photoPlaybackUrls] = await Promise.all([
    greeting.audioUrl ? getPlaybackUrl(greeting.audioUrl) : null,
    greeting.card.coverImageUrl ? getPlaybackUrl(greeting.card.coverImageUrl) : null,
    greeting.card.contentImageUrl ? getPlaybackUrl(greeting.card.contentImageUrl) : null,
    greeting.videoUrl ? getPlaybackUrl(greeting.videoUrl) : null,
    Promise.all(greeting.photoUrls.map((key) => getPlaybackUrl(key))),
  ]);

  return (
    <UnwrapExperience
      greetingId={greeting.id}
      audioUrl={audioPlaybackUrl}
      videoUrl={videoPlaybackUrl}
      photoUrls={photoPlaybackUrls}
      card={{
        title: greeting.card.title,
        description: greeting.card.description,
        paletteFrom: greeting.card.paletteFrom,
        paletteTo: greeting.card.paletteTo,
        occasionSlug: greeting.card.occasionSlug,
        coverImageUrl,
        contentImageUrl,
      }}
      senderName={greeting.sender.name ?? "A friend"}
      recipientName={greeting.recipientName}
      message={greeting.message ?? ""}
      textOverlays={(greeting.textOverlays as TextOverlay[] | null) ?? []}
      avatar={(greeting.avatar as AvatarConfig | null) ?? DEFAULT_AVATAR}
      giftCard={giftCardsOn ? greeting.giftCard : null}
      initialReactions={greeting.reactions}
      initialReplyMessage={greeting.replyMessage}
    />
  );
}
