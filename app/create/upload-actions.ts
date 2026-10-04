"use server";

import { auth } from "@/auth";
import { uploadObject, buildKey, getPlaybackUrl } from "@/lib/s3";

const MAX_BYTES = 15 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string[]> = {
  audio: ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-m4a"],
  photo: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  video: ["video/webm", "video/mp4", "video/quicktime"],
};

export async function uploadWizardMedia(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in to upload media." };

  const file = formData.get("file");
  const kind = formData.get("kind");
  if (!(file instanceof File) || typeof kind !== "string" || !(kind in ALLOWED_TYPES)) {
    return { error: "Invalid upload." };
  }

  if (file.size === 0) return { error: "That file looks empty — try again." };
  if (file.size > MAX_BYTES) return { error: "File is too large (15MB max)." };
  if (!ALLOWED_TYPES[kind].includes(file.type)) return { error: "Unsupported file type." };

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = buildKey(kind, session.user.id, file.name || `${kind}-${Date.now()}`);
  await uploadObject(key, buffer, file.type);
  const previewUrl = await getPlaybackUrl(key);

  return { success: true as const, key, previewUrl };
}

export async function refreshPlaybackUrl(key: string) {
  const session = await auth();
  if (!session?.user) return { error: "Sign in required." };
  return { success: true as const, url: await getPlaybackUrl(key) };
}
