# Portfolio Updates + Learning Tab — Design

**Date:** 2026-06-16

## Context

Two goals in one pass:
1. Correct and expand the About page experience/teaching content to reflect actual work done (no fabricated production claims, accurate descriptions).
2. Add a "Learning" nav tab that surfaces the existing `ml-interview-guide.html` as an iframe at `/learning`. A full React port is a follow-up task for later.

---

## Part 1: Content Edits

### Hero (`web/app/page.tsx`, line 86)

- **Before:** `I write about rebuilding ML from scratch.`
- **After:** `In my free time I like to rebuild ML from scratch.`

### Beltech AI — stack string (`web/app/(public)/about/page.tsx`, line 18)

Remove `DeepStream ·` from the stack string. DeepStream was used internally but isn't part of Samit's current role description.

### Beltech AI — PUCC bullet (`about/page.tsx`, line 23)

Append real-time performance to the existing bullet:

> PUCC pollution-certificate FastAPI service: YOLO verifies probe insertion, LPR reads the plate, OCR'd testing-center name validated against the government registry. Real-time on 10-second clips — **7 s** with frame-skipping on PaddleOCR.

### MakeMyTrip — add to EXPERIENCE array (`about/page.tsx`)

Insert after the Beltech AI entry:

```ts
{
  company: "MakeMyTrip",
  role: "Machine Learning Intern",
  period: "Aug 2022 — Oct 2022",
  location: "Gurgaon",
  stack: "Scala · Redis · MySQL · Kafka · AWS",
  bullets: [
    "Personalization API using multi-armed bandits (ε-greedy, Thompson Sampling, UCB) for homepage engagement. Benchmarked variants.",
    "Trained an RLHF reward model on annotated user-preference data to rank itinerary recommendations.",
    "NLP-based resume screening using text similarity and keyword extraction for the Data team's hiring pipeline.",
  ],
}
```

Note: `location` is already a field on the EXPERIENCE entries (Beltech uses `location: "Bangalore"`) and is rendered as `{job.stack} · {job.location}`. No type changes needed.

### aiengg.dev — bullet 1 (`about/page.tsx`, line 41)

- **Before:** `...Designed assignments, debugged student projects, took office hours.`
- **After:** `...took doubt sessions, designed the course and syllabus.`

Full bullet becomes:
> TA'd a 16-week live AI engineering cohort: ran weekly classes on RAG, agents, fine-tuning, and inference for **200+ engineers**. Designed assignments, took doubt sessions, designed the course and syllabus.

### aiengg.dev — bullet 2 (`about/page.tsx`, line 42)

- **Before:** `Parent platform: InterviewReady. Restructured content for 10k+ subscribers; technical posts reached **20k+ readers**.`
- **After:** `InterviewReady: restructured content for 10k+ subscribers; technical posts reached **20k+ readers**.`

---

## Part 2: Learning Tab (iframe approach)

### Files to create/modify

| File | Action |
|---|---|
| `web/components/public-nav.tsx` | Add `{ href: "/learning", label: "Learning" }` to `links` array |
| `web/public/ml-guide.html` | Copy `ml-interview-guide.html` from repo root |
| `web/app/(public)/learning/page.tsx` | New page (see below) |

### Learning page structure

```tsx
import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";

export const metadata: Metadata = {
  title: "Learning — Samit Mohan",
  description: "ML interview prep guide: 500+ questions covering math, deep learning, LLMs, CV, system design, and MLOps.",
};

export default function LearningPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PublicNav />
      <iframe
        src="/ml-guide.html"
        className="flex-1 w-full border-0"
        style={{ height: "calc(100vh - 56px)" }}
        title="ML Interview Guide"
      />
    </div>
  );
}
```

No padding, title, or description between nav and iframe — straight into the guide. The guide is self-contained (236 KB, dark theme, no external deps) and fills the remaining viewport below the 56px nav. No footer — the guide has its own navigation chrome. Dark theme is intentional and kept as-is.

---

## Verification

1. Run `cd web && npm run dev`
2. Check `/` hero text reads "In my free time I like to rebuild ML from scratch."
3. Check `/about` — Beltech AI stack has no DeepStream; PUCC bullet has 7s frame-skipping line; MakeMyTrip entry appears below Beltech AI
4. Check aiengg.dev bullets — "took doubt sessions, designed the course and syllabus" / "InterviewReady:" prefix
5. Check nav has "Learning" link
6. Navigate to `/learning` — portfolio nav on top, guide fills viewport, search/progress/canvas demos all work
7. Toggle dark/light mode on portfolio — guide retains its own dark theme inside the iframe (expected)

---

## Out of Scope (follow-up)

- Full React port of the guide matching portfolio design system (planned as a separate task)
- Adding the guide's data to site search / ⌘K palette
