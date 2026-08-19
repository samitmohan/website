/**
 * The five marks in the top-right corner, in the order they are drawn.
 *
 * `mark` names a file in public/marks/. They are hand-drawn sketches traced from
 * the originals, painted with a CSS mask rather than an <img>, so they take the
 * page's colour and work in both themes without a second copy of each file.
 */
export type SiteLink = {
  label: string;
  href: string;
  mark: string;
  external?: boolean;
};

export const SOCIAL_LINKS: SiteLink[] = [
  {
    label: "Spotify",
    href: "https://open.spotify.com/user/rajabetaa",
    mark: "spotify",
    external: true,
  },
  {
    label: "GitHub",
    href: "https://github.com/samitmohan",
    mark: "github",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/samit-mohan/",
    mark: "linkedin",
    external: true,
  },
  { label: "Email", href: "mailto:samitmohan@gmail.com", mark: "email" },
  // CV is out until the PDF is refreshed. samit-resume.pdf and
  // public/marks/cv.svg both stay put, so restoring it is this line:
  // { label: "CV", href: "/samit-resume.pdf", mark: "cv", external: true },
];
