import { notFound } from "next/navigation";
import Link from "next/link";
import { courses, getCourse } from "@/config/courses";
import { PublicNav, PublicFooter } from "@/components/public-nav";

const YT_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export async function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return {
    title: `${course.title} — Samit Mohan`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
    },
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);

  if (!course) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-8">
          <Link href="/courses" className="hover:text-foreground transition-colors">
            Courses
          </Link>
          <span>/</span>
          <span className="text-foreground">{course.title}</span>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4 leading-tight">
            {course.title}
          </h1>
          <p className="text-[15px] text-muted-foreground max-w-xl leading-relaxed mb-6">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {course.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
          {course.status === "active" ? (
            <a
              href="https://www.youtube.com/@samitmohan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-[13px] text-foreground hover:bg-muted transition-colors"
            >
              <span className="text-red-500">{YT_ICON}</span>
              Watch on YouTube
            </a>
          ) : (
            <div className="p-4 rounded-lg border border-border bg-muted/30 text-[13px] text-muted-foreground">
              In development. Follow on{" "}
              <a
                href="https://twitter.com/samitmohan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Twitter
              </a>{" "}
              or{" "}
              <a
                href="https://www.youtube.com/@samitmohan"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                YouTube
              </a>{" "}
              for updates.
            </div>
          )}
        </div>

        {/* Curriculum */}
        {course.modules.length > 0 && (
          <div>
            <div className="border-t border-border mb-8" />
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-6">
              Curriculum
            </h2>
            <div className="space-y-8">
              {course.modules.map((module) => (
                <div key={module.title}>
                  <h3 className="text-[14px] font-semibold text-foreground mb-3">
                    {module.title.replace(/^Module \d+:\s*/, "")}
                  </h3>
                  <div className="border border-border rounded-xl overflow-hidden">
                    {module.lectures.map((lecture, i) => (
                      <div
                        key={lecture.id}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i < module.lectures.length - 1 ? "border-b border-border" : ""
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          lecture.status === "done"
                            ? "bg-emerald-500"
                            : lecture.status === "in-progress"
                            ? "bg-amber-400"
                            : "bg-muted-foreground/30"
                        }`} />
                        <span className="flex-1 text-[13px] text-foreground">
                          {lecture.title}
                        </span>
                        {lecture.youtubeUrl && (
                          <a
                            href={lecture.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Watch on YouTube"
                            className="shrink-0 text-red-500 hover:text-red-400 transition-colors"
                          >
                            {YT_ICON}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
