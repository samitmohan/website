/**
 * Next merges metadata shallowly: any segment that defines `alternates`
 * replaces the parent's whole object, so a page setting only `canonical` drops
 * the feed link declared in the root layout. Spread this into every
 * `alternates` that sets a canonical URL.
 */
export const RSS_ALTERNATE = {
  "application/rss+xml": "/blog/rss.xml",
} as const;
