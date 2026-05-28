import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const runtime = "nodejs";
export const alt = "Blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "80px",
          background: "#0F1419",
          color: "#E5E7EB",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            color: "#9CA3AF",
            letterSpacing: "2px",
          }}
        >
          SAMITMOHAN.VERCEL.APP / BLOG
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              width: "48px",
              height: "3px",
              background: "#60A5FA",
              marginBottom: "32px",
            }}
          />
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#F9FAFB",
              lineHeight: 1.1,
              letterSpacing: "-1.5px",
              marginBottom: "24px",
              maxWidth: "1000px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#9CA3AF",
            }}
          >
            {date ? `${date} · ` : ""}Samit Mohan
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
