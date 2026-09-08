import { createHash } from "node:crypto";

/**
 * Responsive image widths, shared by the markdown pipeline that writes the
 * srcset and the post-build script that generates the files.
 *
 * These used to be Next's deviceSizes, because the srcset pointed at
 * /_next/image and that endpoint rejects any width it was not configured for.
 * There is no optimizer now: the variants are plain files under /_img/<w>/,
 * generated after the build from the URLs the HTML actually asks for, so the
 * HTML is the contract and the two halves cannot drift.
 *
 * The steps are chosen for the column, not for a device list. Prose is
 * max-w-[44rem] = 704px, so 704 covers a desktop 1x and 1408 covers 2x; 420
 * and 1080 cover a phone at 1x and 3x.
 */
export const IMAGE_WIDTHS = [420, 704, 1080, 1408] as const;

/** Prose column is 704px, so above md an image never renders wider than that. */
export const SIZES_ATTR = "(min-width: 768px) 704px, 100vw";

/**
 * A variant's URL: the source's basename reduced to URL-safe characters, plus
 * a hash of the full source path.
 *
 * Mirroring the source path directly does not survive contact with the actual
 * filenames. Three images here are called "prompt+llm.webp", "x,ycenter.webp"
 * and "x1,y1,x2,y2.webp". A bare comma ends a srcset entry, so the path has to
 * be percent-encoded - and then the static host does not decode %2B or %2C
 * when it resolves a file, so every one of those six URLs 404s while the file
 * sits right there on disk. Verified against the built output before changing
 * this: 554 of 560 URLs resolved and the six failures were exactly those
 * three images.
 *
 * Encoding is the wrong layer to fix it at. A name that needs no encoding
 * cannot be mis-decoded, and the hash keeps it collision-free while the
 * basename keeps a 404 readable.
 */
export function variantUrl(src: string, width: number): string {
  const hash = createHash("sha256").update(src).digest("hex").slice(0, 8);
  const base = src.slice(src.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
  const safe = base.replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "img";
  return `/_img/${width}/${safe}-${hash}.webp`;
}
