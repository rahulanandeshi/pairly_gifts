import { ImageResponse } from "next/og";

export const alt = "Pairly — Every Celebration Deserves to Feel Personal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFraunces() {
  const css = await (
    await fetch(
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz@9..144&text=" +
        encodeURIComponent("Pairly Every celebration deserves to feel personal."),
    )
  ).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/);
  if (!match) throw new Error("Failed to resolve Fraunces font file");
  const res = await fetch(match[1]);
  return res.arrayBuffer();
}

export default async function OpengraphImage() {
  const fraunces = await loadFraunces();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(120% 90% at 15% -10%, rgba(124,111,255,0.35), transparent 55%), radial-gradient(90% 70% at 92% 0%, rgba(76,201,255,0.22), transparent 55%), linear-gradient(180deg, #0b1220 0%, #0a0f1c 55%, #080c17 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #7c6fff 0%, #c7b9ff 55%, #4cc9ff 100%)",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 256 256" fill="#0b1220">
              <path d="M128 24 L145 106 L232 128 L145 150 L128 232 L111 150 L24 128 L111 106 Z" />
            </svg>
          </div>
          <div style={{ fontSize: 32, color: "#f3f1ea", fontFamily: "Fraunces" }}>Pairly</div>
        </div>
        <div style={{ display: "flex", fontSize: 60, color: "#f3f1ea", fontFamily: "Fraunces", lineHeight: 1.15, maxWidth: 980 }}>
          Every celebration deserves to feel personal.
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#9aa0b8", marginTop: 30, maxWidth: 820 }}>
          AI-crafted greeting cards and gift cards for every culture and celebration.
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Fraunces", data: fraunces, style: "normal", weight: 500 }] },
  );
}
