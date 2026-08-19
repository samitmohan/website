import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// The import firewall this file used to carry guarded the public routes against
// the problems platform's weight: a 988 KB problem catalogue, an auth client, a
// query cache, a zustand store, 300 KB of CodeMirror. All of that is deleted -
// every route in this app is now a public, mostly-static page - so the rules
// have nothing left to restrict and are gone rather than left pointing at paths
// that do not exist. scripts/check-budgets.sh still enforces the weight itself,
// which is the part that actually mattered.
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
