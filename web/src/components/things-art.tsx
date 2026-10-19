/*
 * Drawings for the things-I-like bullets. Flat shapes in fixed colours
 * (objects keep their colour in dark mode), each in a 120x120 box. A cut-out
 * photo in THING_PHOTOS replaces a drawing.
 */
export const ART = {
  book: (
    <svg viewBox="0 0 120 120">
      <rect x="28" y="12" width="64" height="96" rx="3" fill="#c8562a" />
      <rect x="28" y="12" width="7" height="96" fill="#9e3f1c" />
      <path d="M50 58 L60 44 L70 58 L66 74 L54 74 Z" fill="#f3e3c3" />
      <path d="M50 58 L46 46 L56 52 Z M70 58 L74 46 L64 52 Z" fill="#f3e3c3" />
      <rect x="44" y="84" width="34" height="3" rx="1.5" fill="#f3e3c3" opacity=".8" />
      <rect x="50" y="91" width="22" height="2" rx="1" fill="#f3e3c3" opacity=".6" />
    </svg>
  ),
  vinyl: (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="50" fill="#141414" />
      {[44, 38, 32, 26].map((r) => (
        <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#2c2c2c" strokeWidth="1" />
      ))}
      <circle cx="60" cy="60" r="16" fill="#d9261c" />
      <circle cx="60" cy="60" r="2.5" fill="#f4efe6" />
      <path d="M30 34 A40 40 0 0 1 52 22" stroke="#fff" strokeOpacity=".18" strokeWidth="3" fill="none" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 120 120">
      <g transform="rotate(-38 60 60)">
        <rect x="20" y="54" width="70" height="12" rx="2" fill="#2b4a7a" />
        <rect x="20" y="54" width="70" height="4" fill="#3b5f96" />
        <rect x="90" y="55" width="10" height="10" fill="#c9c9c9" />
        <path d="M100 56 L110 60 L100 64 Z" fill="#9a9a9a" />
        <rect x="108" y="59.2" width="5" height="1.6" fill="#333" />
        <rect x="12" y="55" width="8" height="10" rx="1" fill="#c9c9c9" />
        <rect x="6" y="56" width="6" height="8" rx="2" fill="#efe6d6" />
      </g>
    </svg>
  ),
  card: (
    <svg viewBox="0 0 120 120">
      <rect x="30" y="14" width="60" height="88" rx="6" fill="#fbf8f2" stroke="#ddd5c6" />
      <text x="37" y="32" fontFamily="Georgia, serif" fontSize="14" fill="#141414">A</text>
      <path d="M60 46 C 52 56, 44 60, 48 68 C 51 73, 57 72, 58 68 L 55 80 L 65 80 L 62 68 C 63 72, 69 73, 72 68 C 76 60, 68 56, 60 46 Z" fill="#141414" />
    </svg>
  ),
  uno: (
    <svg viewBox="0 0 120 120">
      <rect x="32" y="12" width="58" height="90" rx="7" fill="#141414" />
      <rect x="36" y="16" width="50" height="82" rx="5" fill="#d9261c" />
      <ellipse cx="61" cy="57" rx="20" ry="32" transform="rotate(28 61 57)" fill="#fbf8f2" />
      <text x="61" y="66" textAnchor="middle" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="26" fill="#d9261c">+2</text>
    </svg>
  ),
  controller: (
    <svg viewBox="0 0 120 120">
      <path d="M30 44 H90 C102 44 110 56 112 74 C114 90 104 96 96 86 L86 74 H34 L24 86 C16 96 6 90 8 74 C10 56 18 44 30 44 Z" fill="#202024" />
      <rect x="27" y="56" width="4" height="12" rx="1" fill="#6b6b72" />
      <rect x="23" y="60" width="12" height="4" rx="1" fill="#6b6b72" />
      <circle cx="90" cy="54" r="3" fill="#4ecb9b" />
      <circle cx="97" cy="61" r="3" fill="#e05a6a" />
      <circle cx="83" cy="61" r="3" fill="#d58ad6" />
      <circle cx="90" cy="68" r="3" fill="#7aa7e8" />
      <circle cx="48" cy="74" r="7" fill="#2f2f35" />
      <circle cx="72" cy="74" r="7" fill="#2f2f35" />
    </svg>
  ),
  coffee: (
    <svg viewBox="0 0 120 120">
      <ellipse cx="58" cy="94" rx="40" ry="8" fill="#e8e0d2" />
      <path d="M30 50 H86 L80 88 C79 92 76 94 72 94 H44 C40 94 37 92 36 88 Z" fill="#fbf8f2" stroke="#ddd5c6" />
      <path d="M86 58 C98 58 98 76 84 78" fill="none" stroke="#ddd5c6" strokeWidth="5" />
      <ellipse cx="58" cy="50" rx="28" ry="5" fill="#4a2c1a" />
      <path d="M48 40 C44 32 52 28 48 20 M62 38 C58 30 66 26 62 18" stroke="#c9bfae" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  ),
  sneaker: (
    <svg viewBox="0 0 120 120">
      <path d="M12 82 C12 70 20 66 30 62 L52 50 C58 47 62 48 66 52 L80 64 C92 70 106 72 108 82 Z" fill="#141414" />
      <path d="M10 82 H110 V90 C110 93 108 95 105 95 H15 C12 95 10 93 10 90 Z" fill="#f4efe6" />
      <rect x="10" y="86" width="100" height="2" fill="#d9261c" />
      <circle cx="98" cy="84" r="5" fill="#f4efe6" />
      <path d="M44 56 L52 66 M50 52 L58 62 M56 50 L64 58" stroke="#f4efe6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  chalkboard: (
    <svg viewBox="0 0 120 120">
      <rect x="10" y="22" width="100" height="70" rx="4" fill="#8b5a2b" />
      <rect x="15" y="27" width="90" height="60" rx="2" fill="#2f4a3a" />
      <text x="24" y="52" fontFamily="Georgia, serif" fontSize="15" fill="#e9efe6">∂L/∂w</text>
      <text x="24" y="74" fontFamily="Georgia, serif" fontSize="13" fill="#e9efe6" opacity=".8">= ?</text>
      <rect x="70" y="92" width="16" height="5" rx="1.5" fill="#f4efe6" />
    </svg>
  ),
  theEnd: (
    <svg viewBox="0 0 120 120">
      <path d="M12 34 C30 28 48 30 60 38 C72 30 90 28 108 34 V94 C90 88 72 90 60 98 C48 90 30 88 12 94 Z" fill="#fbf8f2" stroke="#ddd5c6" />
      <path d="M60 38 V98" stroke="#ddd5c6" />
      <text x="84" y="70" textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#141414">The End</text>
      {[48, 56, 64, 72].map((y) => <rect key={y} x="20" y={y} width="32" height="2" rx="1" fill="#c9bfae" />)}
    </svg>
  ),
  grass: (
    <svg viewBox="0 0 120 120">
      <ellipse cx="60" cy="92" rx="50" ry="12" fill="#5d8f3e" />
      {[18, 30, 44, 58, 72, 86, 100].map((x, i) => <path key={x} d={`M${x} 92 Q${x + (i % 2 ? 4 : -4)} 74 ${x + (i % 2 ? -2 : 3)} 62`} stroke="#3f7a2c" strokeWidth="3" fill="none" strokeLinecap="round" />)}
      <path d="M50 58 C42 58 40 70 44 80 C47 88 58 88 60 80 C62 72 60 58 50 58 Z" fill="#e8b996" />
      {[[44, 50], [50, 47], [56, 48], [61, 51]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#e8b996" />)}
    </svg>
  ),
  biryani: (
    <svg viewBox="0 0 120 120">
      <ellipse cx="60" cy="52" rx="42" ry="12" fill="#f3d67a" />
      {[[40, 50], [52, 46], [64, 52], [74, 47], [58, 56], [46, 55], [80, 53]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="3" ry="1.4" fill={i % 3 ? "#fff8e1" : "#e59a2e"} />)}
      <circle cx="66" cy="48" r="5" fill="#7a3b1c" />
      <path d="M18 52 C18 92 102 92 102 52" fill="#b5651d" />
      <path d="M18 52 C18 92 102 92 102 52" fill="none" stroke="#8a4a14" strokeWidth="2" />
      <rect x="10" y="50" width="12" height="5" rx="2" fill="#8a4a14" />
      <rect x="98" y="50" width="12" height="5" rx="2" fill="#8a4a14" />
    </svg>
  ),
  dumbbell: (
    <svg viewBox="0 0 120 120">
      <g transform="rotate(-20 60 60)">
        <rect x="36" y="56" width="48" height="8" rx="3" fill="#9a9a9a" />
        <rect x="18" y="40" width="12" height="40" rx="3" fill="#202024" />
        <rect x="28" y="46" width="9" height="28" rx="2" fill="#2f2f35" />
        <rect x="90" y="40" width="12" height="40" rx="3" fill="#202024" />
        <rect x="83" y="46" width="9" height="28" rx="2" fill="#2f2f35" />
      </g>
    </svg>
  ),
  nailfile: (
    <svg viewBox="0 0 120 120">
      <g transform="rotate(-35 60 60)">
        <rect x="16" y="54" width="70" height="12" rx="6" fill="#d9a7b0" />
        <path d="M22 57 H82 M22 60 H82 M22 63 H82" stroke="#c48b96" strokeWidth=".8" />
        <rect x="84" y="55" width="22" height="10" rx="5" fill="#6b4f6e" />
      </g>
    </svg>
  ),
  socks: (
    <svg viewBox="0 0 120 120">
      <path d="M44 14 H76 V64 L92 82 C100 92 92 106 80 104 L50 98 C40 96 40 86 44 80 Z" fill="#f2c94c" />
      {[22, 34, 46, 58].map((y, i) => <rect key={y} x="44" y={y} width="32" height="6" fill={i % 2 ? "#2f80ed" : "#d9261c"} />)}
      <circle cx="80" cy="92" r="5" fill="#2f80ed" />
      <rect x="44" y="12" width="32" height="6" rx="2" fill="#141414" />
    </svg>
  ),
  kiss: (
    <svg viewBox="0 0 120 120">
      <path d="M22 58 C34 40 50 40 60 50 C70 40 86 40 98 58 C86 62 72 64 60 62 C48 64 34 62 22 58 Z" fill="#d9263f" />
      <path d="M22 58 C40 82 80 82 98 58 C84 64 72 66 60 66 C48 66 36 64 22 58 Z" fill="#b71c35" />
      <path d="M30 58 C46 62 74 62 90 58" stroke="#7d1022" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  glasses: (
    <svg viewBox="0 0 120 120">
      <circle cx="38" cy="62" r="20" fill="#dceaf2" fillOpacity=".5" stroke="#141414" strokeWidth="5" />
      <circle cx="82" cy="62" r="20" fill="#dceaf2" fillOpacity=".5" stroke="#141414" strokeWidth="5" />
      <path d="M56 58 Q60 52 64 58" stroke="#141414" strokeWidth="4" fill="none" />
      <path d="M18 58 L6 50 M102 58 L114 50" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 54 L34 50 M72 54 L78 50" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
    </svg>
  ),
  lap: (
    <svg viewBox="0 0 120 120">
      <rect x="16" y="40" width="88" height="54" rx="20" fill="#e9d8c4" />
      <path d="M16 60 Q60 72 104 60" stroke="#d4bfa6" strokeWidth="2" fill="none" />
      <path d="M60 86 C40 72 44 56 54 58 C58 59 60 62 60 64 C60 62 62 59 66 58 C76 56 80 72 60 86 Z" fill="#d9263f" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 120 120">
      <path d="M20 72 L32 50 H88 L100 72 V96 H20 Z" fill="#7a2e2a" />
      <path d="M14 46 C14 34 106 34 106 46 L96 54 H24 Z" fill="#5c201d" />
      <circle cx="60" cy="76" r="15" fill="#f4efe6" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={60 + 10 * Math.cos((i * Math.PI) / 4.6 + 0.6)} cy={76 + 10 * Math.sin((i * Math.PI) / 4.6 + 0.6)} r="2.2" fill="#7a2e2a" />)}
      <circle cx="60" cy="76" r="4" fill="#c9bfae" />
    </svg>
  ),
  clock4am: (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="62" r="40" fill="#fbf8f2" stroke="#141414" strokeWidth="5" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x="59" y="27" width="2" height="6" fill="#141414" transform={`rotate(${i * 30} 60 62)`} />)}
      <path d="M60 62 L77 72" stroke="#141414" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 62 L60 32" stroke="#141414" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="62" r="3" fill="#d9261c" />
      <text x="96" y="22" fontFamily="Georgia, serif" fontStyle="italic" fontSize="13" fill="#141414">ha</text>
      <text x="8" y="28" fontFamily="Georgia, serif" fontStyle="italic" fontSize="11" fill="#141414">haha</text>
    </svg>
  ),
  punchbag: (
    <svg viewBox="0 0 120 120">
      <path d="M60 4 V18 M60 18 L44 26 M60 18 L76 26" stroke="#555" strokeWidth="2" />
      <rect x="40" y="26" width="40" height="80" rx="16" fill="#8b1e1e" />
      <rect x="40" y="40" width="40" height="5" fill="#141414" />
      <rect x="40" y="88" width="40" height="5" fill="#141414" />
      <path d="M86 52 L100 46 M88 62 L104 62 M86 72 L100 78" stroke="#d9261c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  whiteboard: (
    <svg viewBox="0 0 120 120">
      <rect x="10" y="20" width="100" height="66" rx="3" fill="#ffffff" stroke="#9aa3ad" strokeWidth="3" />
      <path d="M22 66 C34 40 46 40 58 56 S82 72 96 36" stroke="#2f80ed" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M22 38 H44 M22 46 H38" stroke="#d9261c" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="10" y="86" width="100" height="5" fill="#9aa3ad" />
      <g transform="rotate(-12 80 100)"><rect x="62" y="96" width="34" height="8" rx="3" fill="#2f80ed" /><rect x="94" y="97" width="6" height="6" rx="1" fill="#141414" /></g>
    </svg>
  ),
  weather: (
    <svg viewBox="0 0 120 120">
      <circle cx="78" cy="42" r="18" fill="#f2c94c" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x="76.5" y="12" width="3" height="8" rx="1.5" fill="#f2c94c" transform={`rotate(${i * 45} 78 42)`} />)}
      <path d="M26 86 C14 86 12 68 26 66 C26 52 46 48 52 60 C58 52 74 54 74 68 C86 66 90 86 76 86 Z" fill="#eef2f6" stroke="#c9d3dd" strokeWidth="2" />
      <path d="M40 96 L37 104 M56 96 L53 104 M72 96 L69 104" stroke="#7aa7e8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 120 120">
      <path d="M38 18 H82 V44 C82 60 72 70 60 70 C48 70 38 60 38 44 Z" fill="#e2b33c" />
      <path d="M38 26 H24 C24 44 32 50 40 50 M82 26 H96 C96 44 88 50 80 50" stroke="#c9952a" strokeWidth="5" fill="none" />
      <rect x="54" y="70" width="12" height="16" fill="#c9952a" />
      <rect x="40" y="86" width="40" height="12" rx="2" fill="#5c4632" />
      <path d="M52 30 L58 42 L68 28" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" />
    </svg>
  ),
  bookshelf: (
    <svg viewBox="0 0 120 120">
      <rect x="12" y="14" width="96" height="92" rx="3" fill="#8b5a2b" />
      <rect x="18" y="20" width="84" height="38" fill="#5e3d1f" />
      <rect x="18" y="64" width="84" height="36" fill="#5e3d1f" />
      {[[22, "#d9261c", 30], [30, "#2f80ed", 34], [38, "#f2c94c", 28], [46, "#2f4a3a", 34], [54, "#e9d8c4", 32], [62, "#7a2e2a", 30], [72, "#141414", 34], [80, "#6b4fbb", 28], [88, "#3f7a2c", 33]].map(([x, c, h]) => <rect key={`a${x}`} x={x as number} y={58 - (h as number)} width="7" height={h as number} fill={c as string} />)}
      {[[22, "#2f4a3a", 30], [30, "#f2c94c", 34], [40, "#d9261c", 26], [48, "#e9d8c4", 32], [58, "#2f80ed", 30], [66, "#141414", 34], [76, "#7a2e2a", 28], [86, "#6b4fbb", 33]].map(([x, c, h]) => <rect key={`b${x}`} x={x as number} y={100 - (h as number)} width="8" height={h as number} fill={c as string} />)}
    </svg>
  ),
  pinDelhi: (
    <svg viewBox="0 0 120 120">
      <rect x="14" y="30" width="92" height="64" rx="4" fill="#fbf8f2" stroke="#ddd5c6" />
      <path d="M20 80 L44 56 L60 70 L84 46 L100 60" stroke="#c9d3dd" strokeWidth="2" fill="none" />
      <path d="M60 16 C48 16 42 26 42 34 C42 46 60 62 60 62 C60 62 78 46 78 34 C78 26 72 16 60 16 Z" fill="#d9261c" />
      <circle cx="60" cy="34" r="6" fill="#fbf8f2" />
      <text x="60" y="86" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill="#141414">110001</text>
    </svg>
  ),
  pinBangalore: (
    <svg viewBox="0 0 120 120">
      <rect x="14" y="30" width="92" height="64" rx="4" fill="#fbf8f2" stroke="#ddd5c6" />
      <path d="M20 60 L40 74 L62 50 L80 66 L100 48" stroke="#c9d3dd" strokeWidth="2" fill="none" />
      <path d="M60 16 C48 16 42 26 42 34 C42 46 60 62 60 62 C60 62 78 46 78 34 C78 26 72 16 60 16 Z" fill="#2f80ed" />
      <circle cx="60" cy="34" r="6" fill="#fbf8f2" />
      <text x="60" y="86" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="11" fill="#141414">560001</text>
    </svg>
  ),
  notebook: (
    <svg viewBox="0 0 120 120">
      <rect x="22" y="14" width="70" height="92" rx="4" fill="#2f4a3a" />
      <rect x="28" y="18" width="62" height="84" rx="2" fill="#fbf8f2" />
      {[32, 42, 52, 62, 72, 82].map((y) => <rect key={y} x="34" y={y} width={y % 20 ? 46 : 36} height="2" rx="1" fill="#c9bfae" />)}
      {[22, 34, 46, 58, 70, 82, 94].map((y) => <circle key={y} cx="25" cy={y} r="3" fill="#9a9a9a" />)}
      <g transform="rotate(30 92 60)"><rect x="88" y="24" width="7" height="62" rx="2" fill="#d9261c" /><path d="M88 86 L91.5 96 L95 86 Z" fill="#141414" /></g>
    </svg>
  ),
  bangbang: (
    <svg viewBox="0 0 120 120">
      <circle cx="60" cy="60" r="46" fill="#f2c94c" />
      <rect x="40" y="26" width="12" height="44" rx="6" fill="#141414" />
      <circle cx="46" cy="84" r="7" fill="#141414" />
      <rect x="68" y="26" width="12" height="44" rx="6" fill="#141414" />
      <circle cx="74" cy="84" r="7" fill="#141414" />
    </svg>
  ),
  keyboard: (
    <svg viewBox="0 0 120 120">
      <rect x="8" y="34" width="104" height="54" rx="6" fill="#2f2f35" />
      {[0, 1, 2].map((r) => Array.from({ length: 8 - (r === 2 ? 1 : 0) }, (_, c) => <rect key={`${r}${c}`} x={14 + c * 12 + r * 4} y={40 + r * 13} width="10" height="10" rx="2" fill={r === 1 && c === 3 ? "#d9261c" : "#e9e6df"} />))}
      <rect x="30" y="78" width="60" height="6" rx="2" fill="#e9e6df" />
    </svg>
  ),
  tie: (
    <svg viewBox="0 0 120 120">
      <path d="M36 10 L60 22 L84 10 L84 30 L60 24 L36 30 Z" fill="#fbf8f2" stroke="#ddd5c6" />
      <path d="M52 22 H68 L64 34 H56 Z" fill="#1d3a5c" />
      <path d="M56 34 H64 L74 92 L60 110 L46 92 Z" fill="#1d3a5c" />
      <path d="M58 44 L70 56 M54 60 L72 78 M52 78 L66 92" stroke="#d9261c" strokeWidth="3" />
    </svg>
  ),
  tree: (
    <svg viewBox="0 0 120 120">
      <rect x="54" y="62" width="12" height="44" rx="2" fill="#6b4a2b" />
      <circle cx="60" cy="40" r="26" fill="#3f7a2c" />
      <circle cx="38" cy="54" r="18" fill="#4f8f38" />
      <circle cx="82" cy="54" r="18" fill="#4f8f38" />
      <circle cx="60" cy="58" r="16" fill="#5d9e42" />
      <ellipse cx="60" cy="106" rx="34" ry="5" fill="#a9c98f" />
    </svg>
  ),
  guitar: (
    <svg viewBox="0 0 120 120">
      <g transform="rotate(-40 60 60)">
        <rect x="56" y="4" width="8" height="58" fill="#c9952a" />
        <rect x="53" y="0" width="14" height="12" rx="3" fill="#141414" />
        <path d="M60 58 C44 56 34 66 38 78 C40 86 34 92 40 102 C48 116 72 116 80 102 C86 92 80 86 82 78 C86 66 76 56 60 58 Z" fill="#d9261c" />
        <path d="M48 72 C52 66 68 66 72 72 L68 98 C64 102 56 102 52 98 Z" fill="#fbf8f2" />
        <rect x="54" y="78" width="12" height="3" fill="#141414" /><rect x="54" y="86" width="12" height="3" fill="#141414" />
      </g>
    </svg>
  ),
  beer: (
    <svg viewBox="0 0 120 120">
      <rect x="32" y="30" width="46" height="74" rx="6" fill="#f2b632" />
      <path d="M78 46 C96 46 96 82 78 82" stroke="#d9d4c7" strokeWidth="7" fill="none" />
      <path d="M28 34 C28 20 40 18 46 24 C50 14 66 14 70 24 C78 18 88 26 82 36 Z" fill="#fbf8f2" />
      {[[44, 60], [58, 76], [50, 90], [66, 56]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2" fill="#fff6d6" />)}
      <rect x="32" y="30" width="46" height="74" rx="6" fill="none" stroke="#d9d4c7" strokeWidth="3" />
    </svg>
  ),
  sofa: (
    <svg viewBox="0 0 120 120">
      <rect x="18" y="40" width="84" height="34" rx="10" fill="#4f7a8c" />
      <rect x="8" y="56" width="20" height="34" rx="8" fill="#3d6273" />
      <rect x="92" y="56" width="20" height="34" rx="8" fill="#3d6273" />
      <rect x="22" y="66" width="76" height="20" rx="6" fill="#5b8a9d" />
      <rect x="20" y="88" width="6" height="12" fill="#5c4632" /><rect x="94" y="88" width="6" height="12" fill="#5c4632" />
      <rect x="36" y="46" width="20" height="18" rx="5" fill="#f2c94c" />
    </svg>
  ),
} as const;

/** Which bullets get a drawing. Matched against the post's own wording. */
export const DRAWN: [RegExp, keyof typeof ART][] = [
  [/fantastic mr\. fox/i, "book"],
  [/vinyl/i, "vinyl"],
  [/mechanical pencil/i, "pencil"],
  [/card trick/i, "card"],
  [/\buno\b/i, "uno"],
  [/ps2/i, "controller"],
  [/espresso/i, "coffee"],
  [/chuck taylor/i, "sneaker"],
  [/first principles/i, "chalkboard"],
  [/final chapter/i, "theEnd"],
  [/barefoot on grass/i, "grass"],
  [/biryani/i, "biryani"],
  [/working out/i, "dumbbell"],
  [/filing my nails/i, "nailfile"],
  [/funky socks/i, "socks"],
  [/cheek kisses/i, "kiss"],
  [/removing glasses/i, "glasses"],
  [/head on maa/i, "lap"],
  [/vintage items/i, "phone"],
  [/laughing on the floor/i, "clock4am"],
  [/hitting the bag/i, "punchbag"],
  [/whiteboard/i, "whiteboard"],
  [/bangalore weather/i, "weather"],
  [/achieve goals/i, "trophy"],
  [/bookstore/i, "bookshelf"],
  [/110001/i, "pinDelhi"],
  [/560001/i, "pinBangalore"],
  [/writing things down/i, "notebook"],
  [/exclamation marks/i, "bangbang"],
  [/clickity clack/i, "keyboard"],
  [/shirts & ties/i, "tie"],
  [/cubbon park/i, "tree"],
  [/black sabbath|hendrix/i, "guitar"],
  [/sip of beer/i, "beer"],
  [/living rooms/i, "sofa"],
];
