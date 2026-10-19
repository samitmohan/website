import type { Metadata } from "next";
import { Page } from "@/components/Page";
import { ProjectBoard, type BoardProject } from "@/components/ProjectBoard";
import { Reveal } from "@/components/Reveal";
import { PROJECTS } from "@/config/projects";
import { getPost } from "@/lib/blog";
import { inlineSvg } from "@/lib/inline-svg";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things built from scratch to understand them: a small GPT, an autograd engine, YOLO, a coding agent, and more.",
  alternates: { canonical: "/projects" },
  openGraph: { images: ["/og/projects.png"] },
};

export default function Projects() {
  const projects: BoardProject[] = PROJECTS.map((p) => ({
    slug: p.slug,
    name: p.name,
    stack: p.stack,
    blurb: p.blurb,
    repoUrl: p.repoUrl,
    liveUrl: p.liveUrl,
    figure: p.figure ? inlineSvg(p.figure) : "",
    what: p.what,
    how: p.how,
    numbers: p.numbers ?? [],
    posts: (p.posts ?? []).flatMap((slug) => {
      const post = getPost(slug);
      return post ? [{ slug, title: post.title }] : [];
    }),
  }));
  return (
    <Page wide>
      <Reveal slot={0} as="header" className="mx-auto max-w-[620px]">
        <h1 className="text-[22px]">Projects</h1>
      </Reveal>
      <Reveal slot={2} className="mt-10">
        <ProjectBoard projects={projects} />
      </Reveal>
    </Page>
  );
}
