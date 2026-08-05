# Portfolio Updates + Learning Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct experience/teaching content on the About page, fix the hero line, and add a `/learning` tab that serves the ML interview guide via iframe.

**Architecture:** All content lives in `web/app/(public)/about/page.tsx` as inline TypeScript constants — edits are direct string changes. The Learning tab is a new App Router page at `web/app/(public)/learning/page.tsx` with no client state; the guide is served as a static asset from `web/public/ml-guide.html`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS

---

## File Map

| File | Action |
|---|---|
| `web/app/page.tsx` | Modify hero paragraph (line 86) |
| `web/app/(public)/about/page.tsx` | Modify EXPERIENCE + TEACHING arrays |
| `web/components/public-nav.tsx` | Add Learning link |
| `web/public/ml-guide.html` | Create (copy from repo root) |
| `web/app/(public)/learning/page.tsx` | Create new page |

---

## Task 1: Fix hero text

**Files:**
- Modify: `web/app/page.tsx` (line 82-87)

- [ ] **Step 1: Edit the hero paragraph**

In `web/app/page.tsx`, find the paragraph that reads:

```tsx
<p className="text-[15px] text-foreground/80 max-w-xl leading-relaxed">
  I build computer-vision systems for city traffic at Beltech AI: live CCTV,{" "}
  <span className="font-semibold text-foreground">≤10ms</span> inference,{" "}
  <span className="font-semibold text-foreground">0.9+ F1</span> in production.
  I write about rebuilding ML from scratch.
</p>
```

Change the last sentence only:

```tsx
<p className="text-[15px] text-foreground/80 max-w-xl leading-relaxed">
  I build computer-vision systems for city traffic at Beltech AI: live CCTV,{" "}
  <span className="font-semibold text-foreground">≤10ms</span> inference,{" "}
  <span className="font-semibold text-foreground">0.9+ F1</span> in production.
  In my free time I like to rebuild ML from scratch.
</p>
```

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add web/app/page.tsx
git commit -m "fix(hero): rephrase ML scratch line"
```

---

## Task 2: Fix Beltech AI — remove DeepStream + update PUCC bullet

**Files:**
- Modify: `web/app/(public)/about/page.tsx` (lines 18, 23)

- [ ] **Step 1: Remove DeepStream from stack string**

In `web/app/(public)/about/page.tsx`, line 18, change:

```ts
stack: "PyTorch · YOLO · PARSeq · DeepStream · Triton · TensorRT · FastAPI · Kubernetes · Docker",
```

to:

```ts
stack: "PyTorch · YOLO · PARSeq · Triton · TensorRT · FastAPI · Kubernetes · Docker",
```

- [ ] **Step 2: Expand the PUCC bullet with performance numbers**

Line 23, change:

```ts
"PUCC pollution-certificate FastAPI service: YOLO verifies probe insertion, LPR reads the plate, OCR'd testing-center name validated against the government registry.",
```

to:

```ts
"PUCC pollution-certificate FastAPI service: YOLO verifies probe insertion, LPR reads the plate, OCR'd testing-center name validated against the government registry. Real-time on 10-second clips — **7 s** with frame-skipping on PaddleOCR.",
```

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add web/app/(public)/about/page.tsx
git commit -m "fix(about): remove deepstream, add PUCC perf numbers"
```

---

## Task 3: Add MakeMyTrip experience entry

**Files:**
- Modify: `web/app/(public)/about/page.tsx` (EXPERIENCE array, after Beltech AI entry)

- [ ] **Step 1: Add MakeMyTrip to the EXPERIENCE array**

In `web/app/(public)/about/page.tsx`, after the closing `},` of the Beltech AI entry (line 30), insert the MakeMyTrip object — do not touch any Beltech bullets:

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
  },
```

The result is `EXPERIENCE` with two entries: Beltech AI first, MakeMyTrip second.

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify rendering in dev server**

```bash
cd web && npm run dev
```

Navigate to `http://localhost:3000/about`. Confirm:
- MakeMyTrip entry appears below Beltech AI
- Stack reads `Scala · Redis · MySQL · Kafka · AWS · Gurgaon`
- Three bullets render correctly, no bold markers (`**`) visible as raw text

- [ ] **Step 4: Commit**

```bash
git add web/app/(public)/about/page.tsx
git commit -m "feat(about): add MakeMyTrip ML intern experience"
```

---

## Task 4: Fix aiengg.dev teaching bullets

**Files:**
- Modify: `web/app/(public)/about/page.tsx` (TEACHING array, lines 41-42)

- [ ] **Step 1: Update bullet 1 — replace office hours with doubt sessions**

Line 41, change:

```ts
"TA'd a 16-week live AI engineering cohort: ran weekly classes on RAG, agents, fine-tuning, and inference for **200+ engineers**. Designed assignments, debugged student projects, took office hours.",
```

to:

```ts
"TA'd a 16-week live AI engineering cohort: ran weekly classes on RAG, agents, fine-tuning, and inference for **200+ engineers**. Designed assignments, took doubt sessions, designed the course and syllabus.",
```

- [ ] **Step 2: Update bullet 2 — remove "Parent platform" prefix**

Line 42, change:

```ts
"Parent platform: InterviewReady. Restructured content for 10k+ subscribers; technical posts reached **20k+ readers**.",
```

to:

```ts
"InterviewReady: restructured content for 10k+ subscribers; technical posts reached **20k+ readers**.",
```

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add web/app/(public)/about/page.tsx
git commit -m "fix(about): update aiengg teaching bullets"
```

---

## Task 5: Add Learning link to nav

**Files:**
- Modify: `web/components/public-nav.tsx` (lines 14-17)

- [ ] **Step 1: Add the Learning entry**

In `web/components/public-nav.tsx`, change:

```ts
const links = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Posts" },
];
```

to:

```ts
const links = [
  { href: "/about", label: "About" },
  { href: "/blog", label: "Posts" },
  { href: "/learning", label: "Learning" },
];
```

- [ ] **Step 2: Type-check**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add web/components/public-nav.tsx
git commit -m "feat(nav): add Learning link"
```

---

## Task 6: Copy guide to public + create Learning page

**Files:**
- Create: `web/public/ml-guide.html`
- Create: `web/app/(public)/learning/page.tsx`

- [ ] **Step 1: Copy the guide to the public directory**

```bash
cp /Users/samit/personal/portfolio/ml-interview-guide.html /Users/samit/personal/portfolio/web/public/ml-guide.html
```

Verify it copied:

```bash
wc -l /Users/samit/personal/portfolio/web/public/ml-guide.html
```

Expected: `3263`

- [ ] **Step 2: Create the Learning page**

Create `web/app/(public)/learning/page.tsx` with:

```tsx
import type { Metadata } from "next";
import { PublicNav } from "@/components/public-nav";

export const metadata: Metadata = {
  title: "Learning — Samit Mohan",
  description:
    "ML interview prep guide: 500+ questions covering math, deep learning, LLMs, CV, system design, and MLOps.",
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

- [ ] **Step 3: Type-check**

```bash
cd web && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Verify end-to-end in dev server**

```bash
cd web && npm run dev
```

Check:
- Nav shows "Learning" link, highlighted when on `/learning`
- `/learning` loads with portfolio nav on top, guide filling the rest of the viewport
- Guide sidebar, search bar, expandable cards, and canvas demos all work
- No scrollbar appears on the outer page (only inside the iframe)
- Toggle dark/light on portfolio nav — guide retains its own dark theme inside the iframe

- [ ] **Step 5: Commit**

```bash
git add web/public/ml-guide.html web/app/(public)/learning/page.tsx
git commit -m "feat: add /learning tab with ML interview guide"
```

---

## Verification Checklist

After all tasks complete:

- [ ] `/` — hero reads "In my free time I like to rebuild ML from scratch."
- [ ] `/about` — Beltech stack has no "DeepStream"; PUCC bullet ends with "7 s with frame-skipping on PaddleOCR."
- [ ] `/about` — MakeMyTrip entry appears below Beltech AI with 3 bullets
- [ ] `/about` — aiengg bullet 1 has "took doubt sessions, designed the course and syllabus"
- [ ] `/about` — aiengg bullet 2 starts with "InterviewReady:"
- [ ] Nav — "Learning" link appears and highlights on `/learning`
- [ ] `/learning` — guide loads full-viewport, all interactivity works
