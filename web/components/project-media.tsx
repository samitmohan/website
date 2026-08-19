import Image from "next/image";
import type { Project } from "@/config/projects";
import { ProjectVideo } from "@/components/project-video";

/**
 * The panel at the top of a project card: a hover-to-play recording, a still,
 * or - with neither - the project's name set large. That last state is meant to
 * look finished rather than pending: no grey rectangle, no "screenshot coming
 * soon".
 *
 * `contain` rather than `cover`, because these are wide banners with text at
 * their edges and cropping eats it.
 */
export function ProjectMedia({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  if (project.video) {
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

  if (project.image) {
    return (
      <div className="project-media">
        {/* unoptimized on purpose: these are already hand-encoded WebP at
            1400px and 31-48 KB apiece, so the optimizer would spend a
            round-trip re-encoding a file that is smaller than what it would
            produce. width/height are the real dimensions, so the frame still
            reserves its space and nothing shifts on load. */}
        <Image
          src={project.image}
          alt={`${project.name} preview`}
          width={1400}
          height={740}
          className="project-still"
          unoptimized
          priority={priority}
        />
      </div>
    );
  }

  return (
    <div className="project-media project-media-blank">
      <span className="project-media-word">{project.name}</span>
    </div>
  );
}
