import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // The feed lives at /blog/rss.xml. Readers and reviewers guess the root
  // paths first, so send them on rather than 404.
  async redirects() {
    return [
      { source: "/rss.xml", destination: "/blog/rss.xml", permanent: true },
      { source: "/feed.xml", destination: "/blog/rss.xml", permanent: true },
      { source: "/rss", destination: "/blog/rss.xml", permanent: true },
      { source: "/feed", destination: "/blog/rss.xml", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
