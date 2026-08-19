/**
 * The projects grid. One place project data lives.
 *
 * A card takes either a `video` (hover to play, `poster` shown at rest) or a
 * still `image`, and falls back to the project name set large when it has
 * neither. Everything lives in public/assets/projects/, which is served
 * immutable (next.config.ts), so a re-recorded file needs a new name rather
 * than an overwrite.
 */
export type Project = {
  slug: string;
  name: string;
  stack: string;
  blurb: string;
  repoUrl: string;
  liveUrl?: string;
  video?: string;
  poster?: string;
  image?: string;
  /** A hand-authored animated SVG in public/projects/. Served as a plain <img>:
   *  the site is light-only, so these carry literal colours and need none of
   *  the inlining the homepage figures do. */
  figure?: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "mathlm",
    name: "mathLM",
    stack: "PyTorch",
    blurb:
      "A small GPT trained on maths from scratch, tokenizer through reasoning RL.",
    repoUrl: "https://github.com/samitmohan/mathLM",
    figure: "/projects/mathlm.svg",
  },
  {
    slug: "minitorch",
    name: "minitorch",
    stack: "NumPy · CuPy",
    blurb:
      "Reverse-mode autograd in a few hundred lines of NumPy, written to understand backward.",
    repoUrl: "https://github.com/samitmohan/minitorch",
    liveUrl: "https://samitmohan.github.io/minitorch/",
    figure: "/projects/minitorch.svg",
  },
  {
    slug: "mini-code",
    name: "mini-code",
    stack: "Python",
    blurb: "A coding agent in ~350 lines, to find out what is inside the loop.",
    repoUrl: "https://github.com/samitmohan/minicode",
    figure: "/projects/minicode.svg",
  },
  {
    slug: "tennis-analysis",
    name: "tennis-analysis",
    stack: "PyTorch · OpenCV",
    blurb:
      "Tracking players, the ball and court keypoints through match footage.",
    repoUrl: "https://github.com/samitmohan/tennis-analysis",
    video: "/assets/projects/tennis-analysis.mp4",
    poster: "/assets/projects/tennis-analysis.webp",
  },
];
