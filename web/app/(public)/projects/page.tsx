import type { Metadata } from "next";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { ProjectMedia } from "@/components/project-media";
import { PROJECTS } from "@/config/projects";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Things built from scratch: a 40M-param GPT trained on math, PyTorch in 1500 lines, an agent loop, tennis match analysis.",
  alternates: { canonical: "/projects", types: RSS_ALTERNATE },
};

/**
 * A grid of things, read the way a shop reads its products: the artefact first,
 * the description second. Each card is one link to the repo; the live demo,
 * where there is one, is a second link that does not fight the first.
 */
export default function ProjectsPage() {
  return (
    <div className="page">
      <PublicNav />

      <main id="main" className="shell py-14 md:py-20">
        <h1 className="display mb-10 text-[26px] font-semibold text-ink md:text-[32px]">
          Projects
        </h1>

        <div className="project-grid">
          {PROJECTS.map((p, i) => (
            <article key={p.slug} className="project">
              <a
                href={p.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="project-face"
              >
                <ProjectMedia project={p} priority={i < 2} />
                <div className="project-head">
                  <h2 className="project-name">{p.name}</h2>
                  <span className="meta shrink-0">{p.stack}</span>
                </div>
                <p className="project-blurb">{p.blurb}</p>
              </a>

              <div className="project-links">
                <a
                  href={p.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  source ↗
                </a>
                {p.liveUrl ? (
                  <a
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    live ↗
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
