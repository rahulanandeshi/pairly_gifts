"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uploadObject, buildKey, getPlaybackUrl } from "@/lib/s3";

export async function updateCardPrice(cardId: string, price: number) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };

  const parsed = z.number().min(0).max(999).safeParse(price);
  if (!parsed.success) return { error: "Enter a valid price." };

  const card = await prisma.greetingCard.findUnique({ where: { id: cardId }, select: { creatorId: true } });
  if (!card || card.creatorId !== session.user.id) return { error: "Card not found." };

  await prisma.greetingCard.update({
    where: { id: cardId },
    data: { price: parsed.data, premium: parsed.data > 0 },
  });

  revalidatePath("/creator/pricing");
  return { success: true as const };
}

const ANIMATION_STYLES = ["GENTLE_UNFOLD", "CONFETTI_BURST", "WARM_GLOW", "FLOATING_PETALS", "LANTERN_RISE"] as const;

const createCardSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(1000),
  occasionSlug: z.string().trim().min(1),
  cultureSlugs: z.array(z.string()).min(1, "Pick at least one culture"),
  tags: z.array(z.string()),
  premium: z.boolean(),
  price: z.number().min(0).max(999),
  animationStyle: z.enum(ANIMATION_STYLES),
  paletteFrom: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  paletteTo: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  coverImageUrl: z.string().nullable().optional(),
  coverImageWidth: z.number().int().positive().nullable().optional(),
  coverImageHeight: z.number().int().positive().nullable().optional(),
  contentImageUrl: z.string().nullable().optional(),
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

export async function uploadCardImage(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") return { error: "Only creators can upload cards." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "No file provided." };
  if (file.size === 0) return { error: "That file looks empty — try again." };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image is too large (15MB max)." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return { error: "Unsupported image type — use JPEG, PNG, WebP, or GIF." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = buildKey("card-images", session.user.id, file.name || `image-${Date.now()}`);
  await uploadObject(key, buffer, file.type);
  const previewUrl = await getPlaybackUrl(key);

  return { success: true as const, key, previewUrl };
}

export type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCard(input: CreateCardInput) {
  const session = await auth();
  if (!session?.user) return { error: "Not signed in." };
  if (session.user.role !== "CREATOR" && session.user.role !== "ADMIN") return { error: "Only creators can upload cards." };

  const parsed = createCardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  const data = parsed.data;

  const occasion = await prisma.occasion.findUnique({ where: { slug: data.occasionSlug } });
  if (!occasion) return { error: "Select a valid occasion." };

  const baseSlug = `${data.occasionSlug}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const existing = await prisma.greetingCard.findUnique({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

  const card = await prisma.greetingCard.create({
    data: {
      slug,
      title: data.title,
      description: data.description,
      occasionSlug: data.occasionSlug,
      cultures: { connect: data.cultureSlugs.map((s) => ({ slug: s })) },
      tags: data.tags,
      premium: data.premium,
      price: data.premium ? data.price : 0,
      paletteFrom: data.paletteFrom,
      paletteTo: data.paletteTo,
      animationStyle: data.animationStyle,
      coverImageUrl: data.coverImageUrl || null,
      coverImageWidth: data.coverImageWidth ?? null,
      coverImageHeight: data.coverImageHeight ?? null,
      contentImageUrl: data.contentImageUrl || null,
      creatorId: session.user.id,
      status: "PENDING",
    },
  });

  revalidatePath("/creator/uploads");
  redirect(`/creator/uploads?created=${card.id}`);
}
