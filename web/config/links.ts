/**
 * The outbound links in the top-right corner, in the order they appear.
 *
 * `label` is the visible text and the accessible name at once - there is no
 * aria-label on these any more, because the link text used to be a drawing
 * with the name hidden in an attribute. Lowercase to match the rest of the
 * site's chrome and the wordmark.
 */
export type SiteLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const SOCIAL_LINKS: SiteLink[] = [
  { label: "github", href: "https://github.com/samitmohan", external: true },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/samit-mohan/",
    external: true,
  },
  { label: "spotify", href: "https://open.spotify.com/user/rajabetaa", external: true },
  { label: "email", href: "mailto:samitmohan@gmail.com" },
  // CV is out until the PDF is refreshed. public/samit-resume.pdf stays put,
  // so restoring it is this line:
  // { label: "cv", href: "/samit-resume.pdf", external: true },
];

/** The site's own sections, left of the outbound links. */
export const SECTION_LINKS: SiteLink[] = [
  { label: "about", href: "/about" },
  { label: "blog", href: "/blog" },
  { label: "projects", href: "/projects" },
];
