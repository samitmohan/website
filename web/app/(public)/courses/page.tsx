import Link from "next/link";
import { courses } from "@/config/courses";
import { PublicNav, PublicFooter } from "@/components/public-nav";

const YOUTUBE = "https://www.youtube.com/@samitmohan";

export default function CoursesPage() {
  const activeCourses = courses.filter((c) => c.status === "active");
  const comingSoon = courses.filter((c) => c.status === "coming-soon");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
            Courses
          </h1>
        </div>

        <div className="space-y-4 mb-12">
          {activeCourses.map((course) => (
            <div
              key={course.slug}
              className="relative border border-border rounded-xl p-6 bg-card hover:border-primary/40 transition-colors"
            >
              <Link
                href={`/courses/${course.slug}`}
                className="absolute inset-0 rounded-xl"
                aria-label={`View ${course.title} curriculum`}
              />
              <h2 className="text-[17px] font-semibold text-foreground mb-1.5">
                {course.title}
              </h2>
              <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed max-w-xl">
                {course.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:bg-primary/80 transition-colors"
                >
                  View Curriculum
                </Link>
                <a
                  href={YOUTUBE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Watch on YouTube
                </a>
              </div>
            </div>
          ))}
        </div>

        {comingSoon.length > 0 && (
          <div className="border-t border-border pt-8">
            <p className="text-[13px] text-muted-foreground">
              <span className="font-mono text-muted-foreground/60 mr-2">coming soon</span>
              {comingSoon.map((c, i) => (
                <span key={c.slug}>
                  {c.title}
                  {i < comingSoon.length - 1 && (
                    <span className="mx-2 text-muted-foreground/40">·</span>
                  )}
                </span>
              ))}
            </p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
