/**
 * The projects grid. One place project data lives.
 *
 * A card takes an animated `figure` and falls back to the project name set
 * large when it has none. That fallback is meant to look finished rather than
 * pending: no grey rectangle, no "screenshot coming soon".
 *
 * There used to be a `video` option too - a hover-to-play recording with a
 * poster - and every card is a drawing now, so it went out with the last
 * recording rather than sitting unused behind a README.
 */
export type Project = {
  slug: string;
  name: string;
  stack: string;
  blurb: string;
  repoUrl: string;
  liveUrl?: string;
  /** A hand-authored animated SVG in public/projects/, named without the
   *  directory or the extension. Inlined by <Figure>, so it reads the page's
   *  --font-mono and --accent. */
  figure?: `projects/${string}`;
};

export const PROJECTS: Project[] = [
  {
    slug: "mathlm",
    name: "mathLM",
    stack: "PyTorch",
    blurb:
      "A small GPT trained on maths from scratch, tokenizer through reasoning RL.",
    repoUrl: "https://github.com/samitmohan/mathLM",
    figure: "projects/mathlm",
  },
  {
    slug: "minitorch",
    name: "minitorch",
    stack: "NumPy · CuPy",
    blurb:
      "Reverse-mode autograd in a few hundred lines of NumPy, written to understand backward.",
    repoUrl: "https://github.com/samitmohan/minitorch",
    liveUrl: "https://samitmohan.github.io/minitorch/",
    figure: "projects/minitorch",
  },
  {
    slug: "mini-code",
    name: "mini-code",
    stack: "Python",
    blurb: "A coding agent in ~350 lines, to find out what is inside the loop.",
    repoUrl: "https://github.com/samitmohan/minicode",
    figure: "projects/minicode",
  },
  {
    slug: "tennis-analysis",
    name: "tennis-analysis",
    stack: "PyTorch · OpenCV",
    blurb:
      "Tracking players, the ball and court keypoints through match footage.",
    repoUrl: "https://github.com/samitmohan/tennis-analysis",
    figure: "projects/tennis-analysis",
  },
];
