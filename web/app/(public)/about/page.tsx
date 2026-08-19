import type { Metadata } from "next";
import Image from "next/image";
import { PublicNav, PublicFooter } from "@/components/public-nav";
import { RSS_ALTERNATE } from "@/lib/metadata";

export const revalidate = false;

export const metadata: Metadata = {
  title: "About",
  description:
    "AI Scientist at Beltech AI in Bangalore. Detection over live video at city scale, and ML rebuilt from scratch on the side.",
  alternates: { canonical: "/about", types: RSS_ALTERNATE },
};

/**
 * DRAFT COPY. Samit is writing the real text; this is rewritten from what the
 * old homepage said so the page is complete and true in the meantime.
 *
 * Prose only, on purpose. The dated role list this replaced was a CV rendered
 * in HTML, and the CV is already a PDF one click away in the header.
 */
const PARAGRAPHS = [
  `I am an AI Scientist at Beltech AI in Bangalore, where I work on computer
   vision over live video: detection models that read number plates, helmets,
   seatbelts and wrong-way traffic straight off RTSP streams. They run across an
   estate of more than 60,000 cameras in 27 cities, which mostly means the
   interesting problems are not the models. They are the decode pipeline that
   has to stay on the GPU, the latency budget that has to hold at ten
   milliseconds on an edge box, and the retraining loop that has to swap a model
   under live traffic without dropping a frame.`,
  `Before that I interned at Genpact and MakeMyTrip, working on an NLP resume
   screener and a personalization API built on multi-armed bandits, and I
   studied information technology at NHCE.`,
  `Most of what I actually understand came from rebuilding things that already
   exist. An autograd engine, a tokenizer, a small GPT trained on maths, an
   agent loop that turned out to be about 350 lines. Not because the originals
   needed replacing, but because writing the backward pass yourself is the only
   way I have found to genuinely know what it does. I write those up as I go.`,
  `I also teach. I TA'd a sixteen-week AI engineering cohort for a couple of
   hundred engineers, wrote a few hundred implementation and system-design
   problems for TensorTonic, and restructured course material that ended up in
   front of rather more people than I expected.`,
];

export default function AboutPage() {
  return (
    <div className="page">
      <PublicNav />

      <main id="main" className="shell py-14 md:py-20">
        <h1 className="sr-only">About Samit Mohan</h1>

        <div className="about-head">
          <Image
            src="/photo.jpeg"
            alt="Samit Mohan"
            width={400}
            height={400}
            className="about-photo"
            priority
          />
        </div>

        <div className="about-prose">
          {PARAGRAPHS.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
