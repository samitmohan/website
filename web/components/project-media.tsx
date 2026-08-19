import type { Project } from "@/config/projects";
import { ProjectVideo } from "@/components/project-video";

/**
 * The panel at the top of a project card.
 *
 * With a recording it is a muted loop that plays on hover. Without one it is
 * the project's name set large on a tinted ground - the state this page is in
 * today, and it is meant to look finished rather than pending: no grey
 * rectangle, no "screenshot coming soon".
 */
export function ProjectMedia({ project }: { project: Project }) {
  if (!project.video) {
    return (
      <div className="project-media project-media-blank">
        <span className="project-media-word">{project.name}</span>
      </div>
    );
  }

  return (
    <div className="project-media">
      <ProjectVideo
        src={project.video}
        poster={project.poster}
        label={project.name}
      />
    </div>
  );
}
