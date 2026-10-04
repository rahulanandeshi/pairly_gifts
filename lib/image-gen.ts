import "server-only";
import { ILLUSTRATION_STYLES } from "@/lib/illustration-styles";

// TODO: No image-generation provider is wired up yet — this is a placeholder.
//
// Used when a customer types a culture we don't have curated artwork for and
// asks us to generate a custom look. Wire this up to whichever image model
// you have credentials for — OpenAI's Images API (`gpt-image-1`), Stability
// AI, Google's Gemini/Imagen, or Replicate are the common choices. Set
// `IMAGE_GEN_API_KEY` (and adjust the fetch call below for your provider's
// request/response shape) to enable real generation. Untested against a live
// provider — verify before relying on it.
export async function generateCultureArt(prompt: string) {
  const apiKey = process.env.IMAGE_GEN_API_KEY;

  if (!apiKey) {
    console.log(`[image-gen:not-configured] prompt="${prompt}"`);
    return { generated: false as const };
  }

  try {
    // Placeholder request shape (OpenAI Images API). Adjust for your provider.
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024" }),
    });
    if (!res.ok) {
      console.error("[image-gen] generation request failed", await res.text());
      return { generated: false as const };
    }
    const data = await res.json();
    const url = data?.data?.[0]?.url as string | undefined;
    if (!url) return { generated: false as const };
    return { generated: true as const, url };
  } catch (err) {
    console.error("[image-gen] generation threw", err);
    return { generated: false as const };
  }
}

export interface GenerateIllustrationInput {
  description?: string;
  /** Presigned S3 URL of a reference photo (from uploadWizardMedia), used as an image-edit base when the provider supports it. */
  referencePhotoUrl?: string;
  style: string;
}

// TODO: Same placeholder status as generateCultureArt above — no provider
// wired up yet. When a referencePhotoUrl is supplied, swap the endpoint below
// for OpenAI's /v1/images/edits (multipart form with the source image +
// prompt) instead of /v1/images/generations, so the illustration is guided by
// the uploaded photo rather than generated from text alone. Untested against
// a live provider — verify before relying on it.
export async function generateFamilyIllustration(input: GenerateIllustrationInput) {
  const apiKey = process.env.IMAGE_GEN_API_KEY;
  const styleFragment = ILLUSTRATION_STYLES.find((s) => s.id === input.style)?.promptFragment ?? input.style;
  const prompt = `A warm, joyful portrait of a family, ${styleFragment}. ${input.description?.trim() ?? ""}`.trim();

  if (!apiKey) {
    console.log(`[image-gen:not-configured] illustration style="${input.style}" hasPhoto=${!!input.referencePhotoUrl}`);
    return { generated: false as const };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024" }),
    });
    if (!res.ok) {
      console.error("[image-gen] illustration request failed", await res.text());
      return { generated: false as const };
    }
    const data = await res.json();
    const url = data?.data?.[0]?.url as string | undefined;
    if (!url) return { generated: false as const };
    return { generated: true as const, url };
  } catch (err) {
    console.error("[image-gen] illustration generation threw", err);
    return { generated: false as const };
  }
}
