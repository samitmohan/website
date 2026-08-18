import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// The problems platform and the public site share a repo, a design system and a
// deploy. They do not share a bundle. Everything below keeps the platform's
// weight (a 988 KB problem catalogue, an auth client, a query cache, a store)
// out of the routes that serve the homepage and the blog.
const PLATFORM_ONLY = [
  {
    name: "@/config/*",
    message:
      "config/ is the problem catalogue (988 KB of JSON). Read it in a server component and pass down only the fields the markup paints.",
  },
  {
    name: "@/stores/*",
    message: "zustand stores belong to the problems platform. Public routes hold no client state.",
  },
  {
    name: "@/hooks/use-api",
    message: "use-api pulls react-query. Public routes fetch on the server.",
  },
  {
    name: "@/lib/auth-client",
    message: "better-auth belongs to the problems platform.",
  },
  { name: "@tanstack/react-query", message: "Platform only. Public routes fetch on the server." },
  { name: "better-auth", message: "Platform only." },
  { name: "better-auth/react", message: "Platform only." },
  { name: "zustand", message: "Platform only." },
  { name: "codemirror", message: "Platform only. 300 KB of editor has no business on a blog." },
  { name: "react-markdown", message: "Platform only. Posts render through lib/markdown.ts on the server." },
];

const PLATFORM_ONLY_PATTERNS = ["@/config/*", "@/components/problem/*", "@/components/editor/*", "@codemirror/*"];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["app/(public)/**/*.{ts,tsx}", "app/page.tsx", "app/layout.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        { paths: PLATFORM_ONLY, patterns: PLATFORM_ONLY_PATTERNS },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
