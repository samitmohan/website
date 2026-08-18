#!/usr/bin/env bash
# Sum the gzipped weight of every script/style a prerendered route references.
# Run after `npm run build`, from web/.
#
# noModule scripts are excluded: that is Next's core-js polyfill bundle, which
# only legacy browsers download. Counting it inflates every route by ~38 KB.
set -euo pipefail

# Script srcs a modern browser actually fetches, one per line.
modern_scripts() {
  { grep -o '<script src="[^"]*\.js"[^>]*>' "$1" || true; } \
    | grep -v 'noModule' \
    | sed 's/.*src="\([^"]*\)".*/\1/'
}

measure() {
  local html="$1" label="$2"
  [ -f "$html" ] || { printf "%-24s (not prerendered)\n" "$label"; return; }
  local hz jz cz
  hz=$(gzip -c "$html" | wc -c)
  jz=$(modern_scripts "$html" | sort -u | while read -r p; do
    fp=".next${p#/_next}"; [ -f "$fp" ] && gzip -c "$fp" | wc -c; done | awk '{s+=$1} END {print s+0}')
  cz=$({ grep -o '/_next/static/css/[^"]*\.css' "$html" || true; } | sort -u | while read -r p; do
    fp=".next${p#/_next}"; [ -f "$fp" ] && gzip -c "$fp" | wc -c; done | awk '{s+=$1} END {print s+0}')
  printf "%-24s html %6.0f KB   js %6.0f KB   css %5.0f KB\n" \
    "$label" $((hz / 1024)) $((jz / 1024)) $((cz / 1024))
}

echo "gzipped, per route:"
measure .next/server/app/_not-found.html "/_not-found (floor)"
measure .next/server/app/index.html "/"
measure .next/server/app/blog.html "/blog"
measure .next/server/app/fun.html "/fun"
measure .next/server/app/interviews.html "/interviews"
measure .next/server/app/problems.html "/problems"
measure .next/server/app/syllabus.html "/syllabus"
for f in $(find ".next/server/app/(public)/blog/[slug]" -name "*.html" 2>/dev/null | head -1); do
  measure "$f" "/blog/$(basename "$f" .html)"
done
