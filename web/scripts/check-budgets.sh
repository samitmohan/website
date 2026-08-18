#!/usr/bin/env bash
# Hard budgets, enforced after `next build`. An unenforced target is a wish.
#
# Raising a number here is a deliberate act: do it in the same commit as the
# change that needs it, so the diff shows what the growth bought.
set -uo pipefail

fail=0

note() { printf "  %-30s %6s / %-6s  %s\n" "$1" "$2" "$3" "$4"; }

check() { # name actual ceiling unit
  local name="$1" actual="$2" ceiling="$3" unit="$4"
  if [ "$actual" -gt "$ceiling" ]; then
    note "$name" "$actual$unit" "$ceiling$unit" "OVER"
    fail=1
  else
    note "$name" "$actual$unit" "$ceiling$unit" "ok"
  fi
}

# ---------------------------------------------------------------- line count
# config/ is excluded on purpose: it is problem and syllabus data, not code,
# and it does not reach the public routes. Everything that is actually code
# lives under this ceiling.
LOC_CEILING=9000
loc=$(find app components lib hooks stores types \( -name '*.ts' -o -name '*.tsx' \) \
  | xargs cat | wc -l | tr -d ' ')

echo "line count (app components lib hooks stores types, config/ excluded):"
check "source" "$loc" "$LOC_CEILING" ""

# ------------------------------------------------------------- bundle bytes
# Gzipped weight of the scripts a modern browser fetches for a route. noModule
# scripts are Next's core-js bundle, which only legacy browsers download.
route_js_kb() {
  local html="$1"
  [ -f "$html" ] || { echo "-1"; return; }
  { grep -o '<script src="[^"]*\.js"[^>]*>' "$html" || true; } \
    | grep -v 'noModule' \
    | sed 's/.*src="\([^"]*\)".*/\1/' \
    | sort -u \
    | while read -r p; do
        fp=".next${p#/_next}"
        [ -f "$fp" ] && gzip -c "$fp" | wc -c
      done | awk '{s+=$1} END {printf "%d", (s+0)/1024}'
}

route_html_kb() {
  local html="$1"
  [ -f "$html" ] || { echo "-1"; return; }
  gzip -c "$html" | wc -c | awk '{printf "%d", $1/1024}'
}

echo
echo "route JS (gzip, modern browsers):"
# ~149 KB of every number below is react-dom plus the app-router runtime, which
# is the floor for any route in this app. The headroom here is what the site's
# own code is allowed to add on top.
check "/"           "$(route_js_kb .next/server/app/index.html)"      160 "KB"
check "/blog"       "$(route_js_kb .next/server/app/blog.html)"       156 "KB"
check "/fun"        "$(route_js_kb .next/server/app/fun.html)"        154 "KB"
check "/interviews" "$(route_js_kb .next/server/app/interviews.html)" 158 "KB"
check "/problems"   "$(route_js_kb .next/server/app/problems.html)"   185 "KB"
check "/syllabus"   "$(route_js_kb .next/server/app/syllabus.html)"   185 "KB"

echo
echo "route HTML (gzip):"
check "/"           "$(route_html_kb .next/server/app/index.html)"       15 "KB"
check "/blog"       "$(route_html_kb .next/server/app/blog.html)"        15 "KB"
check "/interviews" "$(route_html_kb .next/server/app/interviews.html)"  50 "KB"

# Section pages carry the answer text. The largest one is the number that
# matters; the single-page guide it replaced was 241 KB.
worst_section=$(find .next/server/app/interviews -name '*.html' 2>/dev/null \
  | while read -r f; do gzip -c "$f" | wc -c; done | sort -rn | head -1)
if [ -n "${worst_section:-}" ]; then
  check "/interviews/* (largest)" "$((worst_section / 1024))" 60 "KB"
fi

# ------------------------------------------------------- platform/public leak
# The lint rule in eslint.config.mjs blocks direct imports. This catches the
# transitive case it cannot see, by looking for fingerprints of platform-only
# modules inside the chunks a public route actually loads.
echo
echo "platform code in public bundles:"
leaks=0
for html in .next/server/app/index.html .next/server/app/blog.html .next/server/app/fun.html; do
  [ -f "$html" ] || continue
  route=$(basename "$html" .html)
  { grep -o '<script src="[^"]*\.js"[^>]*>' "$html" || true; } \
    | grep -v 'noModule' \
    | sed 's/.*src="\([^"]*\)".*/\1/' \
    | sort -u \
    | while read -r p; do
        fp=".next${p#/_next}"
        [ -f "$fp" ] || continue
        # weekNumber: config/problems. cm-content: CodeMirror. minisearch must
        # stay behind the palette's dynamic import, not ride along in the nav.
        for marker in weekNumber cm-content QueryClientProvider better-auth ReactMarkdown minisearch; do
          if grep -q "$marker" "$fp"; then
            echo "  LEAK /$route: $marker in $(basename "$p")"
          fi
        done
      done
done > /tmp/leak-check.$$ 2>/dev/null
if [ -s /tmp/leak-check.$$ ]; then
  cat /tmp/leak-check.$$
  leaks=1
  fail=1
else
  note "public routes" "clean" "-" "ok"
fi
rm -f /tmp/leak-check.$$

echo
if [ "$fail" -ne 0 ]; then
  echo "budget exceeded. Cut the weight, or raise the ceiling in scripts/check-budgets.sh"
  exit 1
fi
echo "all budgets ok"
