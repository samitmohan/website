import type { Project } from "@/config/projects";
import { Figure } from "@/components/figure";

/**
 * The panel at the top of a project card: a hand-authored animated SVG, or -
 * without one - the project's name set large. That fallback is meant to look
 * finished rather than pending: no grey rectangle, no "screenshot coming soon".
 */
export function ProjectMedia({ project }: { project: Project }) {
  if (project.figure) {
    return (
      <div className="project-media project-media-figure">
        {/* Inlined rather than served through <img>. An <img> SVG is its own
            document: it cannot see the page's --font-mono, so its labels fell
            back to the OS monospace while the project name directly beneath
            them rendered in Geist Mono - two monos on one card. Inlined, the
            drawing reads the page's type and its accent.

            Costs 13.7 KB of markup across the four cards, which is 2.7 KB
            gzipped: /projects goes 6.4 -> 9.1 KB against a 15 KB ceiling. It
            also drops four requests. */}
        <Figure name={project.figure} className="project-figure" />
      </div>
    );
  }

  return (
    <div className="project-media project-media-blank">
      <span className="project-media-word">{project.name}</span>
    </div>
  );
}
