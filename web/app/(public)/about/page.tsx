import type { Metadata } from "next";
import Link from "next/link";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const revalidate = false;

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Scientist at beltech.ai, building models and optimising inference for security, surveillance and traffic management across 50+ cities.",
  alternates: { canonical: "/about", types: RSS_ALTERNATE },
};

/**
 * Samit's own copy, verbatim. Prose and a photograph, nothing else - the dated
 * role list this replaced was a CV rendered in HTML, and the CV is a PDF one
 * click away in the header.
 */
export default function AboutPage() {
  return (
    <div className="page accent-teal">
      <PublicNav />

      <main id="main" className="shell relative py-14 md:py-20">
        <h1 className="sr-only">About Samit Mohan</h1>

        <div className="about-head">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image
              is the only thing on this route that pulls a client bundle: 8.4 KB
              gzip of image runtime, which is what put /about at 153 KB against
              a 156 KB ceiling while every other route sat at 148 KB. It buys
              nothing here. The source is a 21 KB 460x460 JPEG that never
              changes, displayed at a fixed 108-128 px, so there is no srcset
              worth generating and no layout to reserve beyond the width and
              height already on the element. */}
          <img
            src="/photo.jpeg"
            alt="Samit Mohan"
            width={460}
            height={460}
            className="about-photo"
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="about-prose">
          <p>
            I am an AI Scientist at{" "}
            <a
              href="https://beltech.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              beltech.ai
            </a>
            , working on building models and optimising inference for security,
            surveillance, and traffic management across 50+ cities, processing
            60k+ cameras, serving models with latency &lt;= 10ms on an edge box.
            My work focuses on inference management, computer vision, and writing
            business logic for detecting violations in India.
          </p>

          <p>
            I graduated from New Horizon College of Engineering in 2024 with a
            degree in Computer Science and a 9.4 CGPA. Creating multiple
            programming competitions &amp; mentoring juniors in algorithms led me
            to start a coding culture in my college &amp; create a club around
            it. I interned at MakeMyTrip and Genpact where I worked on
            reinforcement learning algorithms and classical ML.
          </p>

          <p>
            Apart from this, I love to teach and write. I TA&rsquo;d a 16 week AI
            Engineering cohort for 200+ senior engineers at{" "}
            <a
              href="https://aiengg.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              aiengg.dev
            </a>
            , designing their curriculum, taking classes, and solving doubts.
            Also wrote a few hundred deep learning implementation and system
            design problems for{" "}
            <a
              href="https://www.tensortonic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              tensortonic.com
            </a>
            , which serves 50k+ users. Writing the backward pass is the only
            way I have found to learn anything which is why the{" "}
            <Link href="/blog" className="about-link">
              blog
            </Link>{" "}
            exists.
          </p>

          <p>
            <a
              href="https://www.youtube.com/watch?v=JuYeHPFR3f0"
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              I want to be the very best, like no one ever was.
            </a>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
