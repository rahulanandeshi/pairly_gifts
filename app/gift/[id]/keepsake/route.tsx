import { ImageResponse } from "next/og";
import { getSentGreetingById } from "@/lib/gift";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const greeting = await getSentGreetingById(id);
  if (!greeting) return new Response("Not found", { status: 404 });

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: `linear-gradient(160deg, ${greeting.card.paletteFrom} 0%, ${greeting.card.paletteTo} 100%)`,
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.25)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 256 256" fill="#ffffff">
              <path d="M128 24 L145 106 L232 128 L145 150 L128 232 L111 150 L24 128 L111 106 Z" />
            </svg>
          </div>
          <div style={{ fontSize: 26, opacity: 0.9 }}>Pairly</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 600, maxWidth: 900 }}>{greeting.card.title}</div>
          <div style={{ display: "flex", fontSize: 28, lineHeight: 1.5, maxWidth: 900, opacity: 0.95 }}>
            &ldquo;{(greeting.message ?? "").length > 220 ? `${greeting.message!.slice(0, 220)}…` : (greeting.message ?? "")}&rdquo;
          </div>
          <div style={{ display: "flex", fontSize: 22, opacity: 0.85, marginTop: 12 }}>
            From {greeting.sender.name ?? "a friend"} to {greeting.recipientName}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 1500 },
  );

  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="pairly-${id}-keepsake.png"`,
    },
  });
}
