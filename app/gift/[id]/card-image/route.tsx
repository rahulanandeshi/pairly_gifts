import { ImageResponse } from "next/og";
import { getSentGreetingById } from "@/lib/gift";
import { getPlaybackUrl } from "@/lib/s3";

// The actual card artwork, no message/text overlay — a separate, simpler
// download from /keepsake (which renders a stylized summary with the
// message). Falls back to the palette gradient when no cover image has
// been uploaded for the card yet.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const greeting = await getSentGreetingById(id);
  if (!greeting) return new Response("Not found", { status: 404 });

  const [coverUrl, contentUrl] = await Promise.all([
    greeting.card.coverImageUrl ? getPlaybackUrl(greeting.card.coverImageUrl) : null,
    greeting.card.contentImageUrl ? getPlaybackUrl(greeting.card.contentImageUrl) : null,
  ]);

  const gradient = `linear-gradient(135deg, ${greeting.card.paletteFrom}, ${greeting.card.paletteTo})`;
  const panelWidth = 1000;
  const panelHeight = 1250;

  const image = new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", width: panelWidth, height: panelHeight, background: gradient }}>
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse requires a plain <img>, not next/image
            <img src={coverUrl} alt="" width={panelWidth} height={panelHeight} style={{ objectFit: "cover" }} />
          )}
        </div>
        {contentUrl && (
          <div style={{ display: "flex", width: panelWidth, height: panelHeight, background: gradient }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og ImageResponse requires a plain <img>, not next/image */}
            <img src={contentUrl} alt="" width={panelWidth} height={panelHeight} style={{ objectFit: "cover" }} />
          </div>
        )}
      </div>
    ),
    { width: contentUrl ? panelWidth * 2 : panelWidth, height: panelHeight },
  );

  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="pairly-${id}-card.png"`,
    },
  });
}
