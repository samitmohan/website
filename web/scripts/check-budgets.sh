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

# ------------------------------------------------------- dark theme integrity
# The dark palette is written twice in app/globals.css - once under the OS
# media query, once under [data-theme="dark"] - because CSS cannot share a
# value set between a media query and a selector. A comment saying "keep these
# identical" is a wish; this is the check.
echo
echo "dark theme:"
dark_blocks=$(python3 - <<'PY_EOF'
import re, sys
s = open("app/globals.css").read()
blocks = []
for sel in [r':root:not\(\[data-theme="light"\]\)\s*\{', r':root\[data-theme="dark"\]\s*\{']:
    m = re.search(sel, s)
    if not m:
        print("MISSING"); sys.exit(0)
    i = s.index("{", m.start()); d = 0
    for j in range(i, len(s)):
        if s[j] == "{": d += 1
        elif s[j] == "}":
            d -= 1
            if d == 0: break
    decls = re.findall(r"(--[\w-]+|color-scheme)\s*:\s*([^;]+);", s[i:j])
    blocks.append(tuple(sorted((k, v.strip()) for k, v in decls)))
print("MATCH" if blocks[0] == blocks[1] else "DIFFER")
print(len(blocks[0]))
PY_EOF
)
verdict=$(echo "$dark_blocks" | head -1)
count=$(echo "$dark_blocks" | tail -1)
if [ "$verdict" = "MATCH" ]; then
  note "palette copies" "$count" "$count" "ok"
else
  note "palette copies" "$verdict" "MATCH" "OVER"
  fail=1
fi

# ---------------------------------------------------------------- line count
# The 988 KB problem catalogue this used to exclude is deleted, so config/ is
# now four dozen lines of links and project entries and counts like everything
# else. The ceiling came down with the platform: 9000 was sized for a codebase
# that no longer exists.
LOC_CEILING=5000
loc=$(find app components lib config \( -name '*.ts' -o -name '*.tsx' \) \
  | xargs cat | wc -l | tr -d ' ')

echo "line count (app components lib config):"
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
check "/about"      "$(route_js_kb .next/server/app/about.html)"      156 "KB"
check "/projects"   "$(route_js_kb .next/server/app/projects.html)"   158 "KB"
check "/blog"       "$(route_js_kb .next/server/app/blog.html)"       156 "KB"
check "/fun"        "$(route_js_kb .next/server/app/fun.html)"        154 "KB"
check "/interviews" "$(route_js_kb .next/server/app/interviews.html)" 158 "KB"

echo
echo "route HTML (gzip):"
# The homepage inlines three animated SVGs (see lib/inline-svg.ts for why they
# cannot be <img>). That is what this number buys; the seven hand-drawn marks
# around them are masks, not markup, and cost the HTML nothing.
check "/"           "$(route_html_kb .next/server/app/index.html)"       15 "KB"
check "/about"      "$(route_html_kb .next/server/app/about.html)"       15 "KB"
check "/projects"   "$(route_html_kb .next/server/app/projects.html)"    15 "KB"
check "/blog"       "$(route_html_kb .next/server/app/blog.html)"        15 "KB"
check "/interviews" "$(route_html_kb .next/server/app/interviews.html)"  50 "KB"

# Section pages carry the answer text. The largest one is the number that
# matters; the single-page guide it replaced was 241 KB.
worst_section=$(find .next/server/app/interviews -name '*.html' 2>/dev/null \
  | while read -r f; do gzip -c "$f" | wc -c; done | sort -rn | head -1)
if [ -n "${worst_section:-}" ]; then
  check "/interviews/* (largest)" "$((worst_section / 1024))" 60 "KB"
fi

# ----------------------------------------------------------- heavy-dep check
# Every route is public now, so the old platform/public firewall is gone. What
# is still worth catching is a heavy library sneaking into a route that should
# be static markup: the blog and the homepage render on the server and have no
# business shipping a markdown parser or a search index to the client.
echo
echo "heavy deps in static routes:"
leaks=0
for html in .next/server/app/index.html .next/server/app/about.html .next/server/app/projects.html .next/server/app/blog.html; do
  [ -f "$html" ] || continue
  route=$(basename "$html" .html)
  { grep -o '<script src="[^"]*\.js"[^>]*>' "$html" || true; } \
    | grep -v 'noModule' \
    | sed 's/.*src="\([^"]*\)".*/\1/' \
    | sort -u \
    | while read -r p; do
        fp=".next${p#/_next}"
        [ -f "$fp" ] || continue
        for marker in ReactMarkdown minisearch cm-content katex-html; do
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
