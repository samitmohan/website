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
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FFFDF8",
          color: "#141414",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "18px",
            letterSpacing: "2px",
            color: "#767369",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "999px",
                background: "#E6651B",
              }}
            />
            AI SCIENTIST · BANGALORE
          </div>
          <div>SAMITMOHAN.IN</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "128px",
              fontWeight: 400,
              color: "#141414",
              lineHeight: 0.95,
              letterSpacing: "-4px",
            }}
          >
            Samit Mohan
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#5C5A55",
              lineHeight: 1.45,
              maxWidth: "760px",
              marginTop: "28px",
            }}
          >
            Computer vision in production, and machine learning rebuilt from
            scratch in public.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "48px",
            borderTop: "1px solid #E8E3D8",
            paddingTop: "28px",
            fontSize: "20px",
            color: "#2C2CE8",
          }}
        >
          <div>≤10ms inference</div>
          <div>0.9+ F1 in production</div>
          <div>100+ cameras per server</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
