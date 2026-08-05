"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Heading = { id: string; text: string; level: number };

export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => {
        const reduce =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-rule bg-surface text-ink-2 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-border hover:text-brand"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

export function PostTOC({ scope }: { scope: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.querySelector(scope);
    if (!root) return;
    const t = setTimeout(() => {
      const nodes = Array.from(root.querySelectorAll("h2, h3"));
      const collected: Heading[] = [];
      for (const n of nodes) {
        const id = (n as HTMLElement).id;
        const text = n.textContent || "";
        if (!id || !text) continue;
        collected.push({ id, text, level: n.tagName === "H2" ? 2 : 3 });
      }
      setHeadings(collected);
    }, 80);
    return () => clearTimeout(t);
  }, [scope]);

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId((visible[0].target as HTMLElement).id);
        }
      },
      { rootMargin: "0px 0px -70% 0px" }
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 4) return null;

  return (
    <aside className="fixed top-32 right-6 hidden max-h-[70vh] w-56 overflow-y-auto text-[12.5px] leading-relaxed xl:block 2xl:right-12">
      <div className="label mb-4">
        Contents
      </div>
      <ul className="space-y-0.5 border-l border-rule">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l py-1.5 transition-all duration-200 hover:border-brand hover:text-ink ${
                h.level === 3 ? "pl-6" : "pl-4"
              } ${
                activeId === h.id
                  ? "border-brand font-medium text-brand"
                  : "border-transparent text-ink-3"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export function PostKeyboardNav({ prevHref, nextHref }: { prevHref: string | null; nextHref: string | null }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "j" && nextHref) {
        e.preventDefault();
        router.push(nextHref);
      } else if (e.key === "k" && prevHref) {
        e.preventDefault();
        router.push(prevHref);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, router]);
  return null;
}

