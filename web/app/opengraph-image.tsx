import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Samit Mohan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px",
          background: "#0C111D",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "3px",
            background: "#0EA5E9",
            marginBottom: "32px",
          }}
        />
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#F9FAFB",
            lineHeight: 1.1,
            letterSpacing: "-2px",
            marginBottom: "20px",
          }}
        >
          Samit Mohan
        </div>
        <div
          style={{
            fontSize: "24px",
            color: "#6B7280",
            lineHeight: 1.5,
            maxWidth: "700px",
          }}
        >
          ML/AI engineer. CV systems, teaching, and writing about building ML from scratch.
        </div>
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "80px",
            fontSize: "16px",
            color: "#374151",
            fontFamily: "monospace",
          }}
        >
          samitmohan.in
        </div>
      </div>
    ),
    { ...size }
  );
}
