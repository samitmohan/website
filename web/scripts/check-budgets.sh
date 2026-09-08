#!/usr/bin/env bash
# Hard budgets, enforced after `astro build`. An unenforced target is a wish.
#
# Raising a number here is a deliberate act: do it in the same commit as the
# change that needs it, so the diff shows what the growth bought.
#
# The ceilings dropped by an order of magnitude when React left. Under Next
# every route carried ~149 KB of gzipped JavaScript, of which 132 KB was
# react-dom plus the App Router runtime - the floor for any App Router page on
# a site where every route was already fully prerendered. There is no framework
# JavaScript now, so these numbers measure the site instead of the framework.
set -uo pipefail

fail=0
note() { printf "  %-30s %6s / %-6s  %s\n" "$1" "$2" "$3" "$4"; }
check() {
  local name="$1" actual="$2" ceiling="$3" unit="$4"
  if [ "$actual" -gt "$ceiling" ]; then
    note "$name" "$actual$unit" "$ceiling$unit" "OVER"; fail=1
  else
    note "$name" "$actual$unit" "$ceiling$unit" "ok"
  fi
}

# ------------------------------------------------------- dark theme integrity
# The dark palette is written twice in src/styles/globals.css - once under the
# OS media query, once under [data-theme="dark"] - because CSS cannot share a
# value set between a media query and a selector. A comment saying "keep these
# identical" is a wish; this is the check.
echo "dark theme:"
dark_blocks=$(python3 - <<'PY_EOF'
import re, sys
s = open("src/styles/globals.css").read()
blocks = []
for sel in [r':root:not\(\[data-theme="light"\]\)\s*\{', r':root\[data-theme="dark"\]\s*\{']:
    m = re.search(sel, s)
    if not m:
        print("MISSING"); print(0); sys.exit(0)
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
pcount=$(echo "$dark_blocks" | tail -1)
if [ "$verdict" = "MATCH" ]; then note "palette copies" "$pcount" "$pcount" "ok"
else note "palette copies" "$verdict" "MATCH" "OVER"; fail=1; fi

# ---------------------------------------------------------------- line count
LOC_CEILING=3200
loc=$(find src \( -name '*.ts' -o -name '*.astro' \) | xargs cat | wc -l | tr -d ' ')
echo
echo "line count (src, ts + astro):"
check "source" "$loc" "$LOC_CEILING" ""

# ------------------------------------------------------------- shipped bytes
# Gzipped weight of everything a browser fetches for a route: the HTML, the one
# shared stylesheet, and any JavaScript. There is no framework bundle, so a
# non-zero JS number here means a component grew a <script> - which is allowed,
# and worth seeing in a diff.
gz() { [ -f "$1" ] && gzip -c "$1" | wc -c | tr -d ' ' || echo 0; }
css_bytes=0
for f in dist/_astro/*.css; do css_bytes=$((css_bytes + $(gz "$f"))); done

route_kb() {
  local html="dist/$1.html"
  [ -f "$html" ] || { echo "-1"; return; }
  local total=$(( $(gz "$html") + css_bytes ))
  for a in $(grep -oE '/_astro/[^"]+\.js' "$html" 2>/dev/null | sort -u); do
    total=$(( total + $(gz "dist$a") ))
  done
  echo $(( total / 1024 ))
}

echo
echo "route weight (gzip, html + css + js):"
check "/"                 "$(route_kb index)"            22 "KB"
check "/about"            "$(route_kb about)"            20 "KB"
check "/projects"         "$(route_kb projects)"         22 "KB"
check "/blog"             "$(route_kb blog)"             21 "KB"
check "/fun"              "$(route_kb fun)"              19 "KB"
check "/404"              "$(route_kb 404)"              18 "KB"
# The guide paints every question on one page; the answers live per section.
check "/interviews"       "$(route_kb interviews)"       36 "KB"

echo
echo "heaviest page of each kind:"
worst() {
  local best=0 name=""
  for f in $1; do
    [ -f "$f" ] || continue
    local kb=$(( ($(gz "$f") + css_bytes) / 1024 ))
    if [ "$kb" -gt "$best" ]; then best=$kb; name=$(basename "$f" .html); fi
  done
  echo "$best $name"
}
# Measured, not guessed: the heaviest post is /blog/nn at 75 KB and the
# heaviest section /interviews/s5 at 33 KB, both of which are almost entirely
# prose and inlined figures. The ceilings sit a little above those so a post
# that doubles in length shows up here. Under Next the same pages carried
# another 149 KB of runtime on top of these numbers.
read -r kb name <<< "$(worst 'dist/blog/*.html')"
check "/blog/$name" "$kb" 82 "KB"
read -r kb name <<< "$(worst 'dist/interviews/*.html')"
check "/interviews/$name" "$kb" 40 "KB"

# --------------------------------------------------------- framework absence
# The whole point. If a UI framework ever comes back, its runtime lands in
# dist/_astro as a chunk far bigger than anything hand-written here.
echo
echo "no framework runtime:"
biggest=0
for f in $(find dist/_astro -name '*.js' 2>/dev/null); do
  kb=$(( $(gz "$f") / 1024 ))
  [ "$kb" -gt "$biggest" ] && biggest=$kb
done
check "largest js chunk" "$biggest" 5 "KB"

echo
if [ "$fail" -ne 0 ]; then echo "budget exceeded"; exit 1; fi
echo "all budgets ok"
