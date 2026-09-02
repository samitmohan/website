import { ImageResponse } from "next/og";
import { getPost, getAllSlugs } from "@/lib/blog";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "Samit Mohan";
  const date = post?.date
    ? new Date(post.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

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
            gap: "12px",
            fontSize: "18px",
            color: "#767369",
            letterSpacing: "2px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "999px",
              background: "#E6651B",
            }}
          />
          SAMITMOHAN.IN / WRITING
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: "76px",
              fontWeight: 400,
              color: "#141414",
              lineHeight: 1.02,
              letterSpacing: "-2.5px",
              marginBottom: "32px",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              gap: "14px",
              borderTop: "1px solid #E8E3D8",
              paddingTop: "28px",
              fontSize: "22px",
              color: "#5C5A55",
            }}
          >
            <span style={{ color: "#2C2CE8" }}>Samit Mohan</span>
            {date ? <span style={{ color: "#CFC9BB" }}>·</span> : null}
            {date ? <span>{date}</span> : null}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
