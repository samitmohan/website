"""Build public/fonts/samit-serif_{regular,italic}.woff2 from Libron's web release.

    curl -sL -o /tmp/lw.zip https://github.com/nicoverbruggen/libron/releases/download/v0.30/Libron_Web.zip
    unzip -o /tmp/lw.zip -d /tmp/lw
    uv run --with fonttools --with brotli python scripts/subset-libron.py /tmp/lw

Keeps Basic Latin, Latin-1 and the typographic punctuation the site uses, plus
kern, liga, tnum and pnum. Drops small caps and TrueType hinting. The OFL FAQ
(2.6) treats a subset as a Modified Version, and "Libron" is a Reserved Font
Name, so the output is renamed "Samit Serif". The copyright notice (name ID 0)
and license URL stay as shipped.
"""

import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parent.parent / "public" / "fonts"

# The 228 codepoints the Charter subset carried, plus the math, prime, currency
# and hat characters the posts use that Libron has and Charter's subset lacked.
UNICODES = (
    list(range(0x20, 0x7F))
    + [c for c in range(0xA1, 0x100) if c != 0xAD]
    + [0x131, 0x141, 0x142, 0x152, 0x153, 0x160, 0x161, 0x178, 0x17D, 0x17E, 0x192, 0x2C6, 0x2C7, 0x2D8,
       0x2D9, 0x2DA, 0x2DB, 0x2DC, 0x2DD, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C,
       0x201D, 0x201E, 0x2020, 0x2021, 0x2022, 0x2026, 0x2030, 0x2039, 0x203A, 0x2044,
       0x2122, 0x2212, 0xFB01, 0xFB02]
    + [0xA0, 0x177, 0x302, 0x303, 0x2032, 0x20AC, 0x20B9, 0x2248, 0x2260, 0x2264, 0x2265]
)

for style in ("Regular", "Italic"):
    font = TTFont(SRC / f"Libron-{style}.woff2")
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.layout_features = ["kern", "liga", "tnum", "pnum"]
    opts.hinting = False
    opts.name_IDs = ["*"]
    opts.name_languages = ["*"]
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    for rec in font["name"].names:
        if rec.nameID in (1, 16):
            rec.string = "Samit Serif"
        elif rec.nameID == 4:
            rec.string = f"Samit Serif {style}"
        elif rec.nameID == 6:
            rec.string = f"SamitSerif-{style}"
        elif rec.nameID == 3:
            rec.string = f"SamitSerif-{style};subset of Libron v0.30"
    font.flavor = "woff2"
    dst = OUT / f"samit-serif_{style.lower()}.woff2"
    font.save(dst)
    print(dst.name, dst.stat().st_size)
