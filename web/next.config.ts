import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    // Wraps client-side route changes in document.startViewTransition, which
    // is what lets the CSS view-transition-name pairs in globals.css morph a
    // homepage door figure into the page figure it opens onto.
    //
    // React's <ViewTransition> component is the other half of this API and is
    // deliberately not used: it is not exported from react 19.2.4 stable, only
    // from canary, and swapping React channels for one animation is a bad
    // trade on a site with 3 KB of JS headroom on /about. The named pairs
    // below need no component.
    viewTransition: true,
  },
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
