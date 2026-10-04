import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7c6fff 0%, #c7b9ff 55%, #4cc9ff 100%)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 256 256" fill="#0b1220">
          <path d="M128 24 L145 106 L232 128 L145 150 L128 232 L111 150 L24 128 L111 106 Z" />
        </svg>
      </div>
    ),
    size,
  );
}
