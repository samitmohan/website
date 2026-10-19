"use client";

import { useEffect, useState } from "react";
import { EMAIL } from "@/content/site";

/**
 * Fixed oval buttons in the top corners. "Contents" lists the page's
 * sections and marks the one in view; past 60px of scroll they fade back.
 */
export function CornerControls({ sections }: { sections: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState(false);
  const [current, setCurrent] = useState(sections[0]?.id);
  const [quiet, setQuiet] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onScroll = () => setQuiet(scrollY > 60);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [sections]);

  const fade = quiet && !open && !contact ? "opacity-40 blur-[1.8px] hover:opacity-100 hover:blur-0" : "";
  return (
    <>
      <div className={`fixed top-4 left-4 z-50 transition-[opacity,filter] duration-300 ${fade}`}>
        <button type="button" className="oval bg-bg" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          Contents
        </button>
        {open && (
          <ol className="mt-2 w-52 rounded-[3px] bg-[#2c2c2c] p-2 text-[13px] text-white/70 shadow-xl">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setOpen(false)}
                  className={`flex gap-3 rounded px-2 py-1.5 hover:bg-white/10 ${current === s.id ? "text-white" : ""}`}
                >
                  <span className="meta text-white/40">{String(i + 1).padStart(2, "0")}</span>
                  {s.label}
                  {current === s.id && <span className="ml-auto text-[#ff4a3d]">●</span>}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className={`fixed top-4 right-4 z-50 flex flex-col items-end transition-[opacity,filter] duration-300 ${fade}`}>
        <div className="flex gap-2">
          <button type="button" className="oval bg-bg" aria-expanded={contact} onClick={() => setContact((o) => !o)}>
            Contact
          </button>
          <a className="oval bg-bg" href="https://github.com/samitmohan">GitHub</a>
        </div>
        {contact && (
          <div className="mt-2 w-64 rounded-[3px] bg-[#2c2c2c] p-3 text-[13px] text-white/80 shadow-xl">
            <p className="text-white">{EMAIL}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-full border border-white/30 px-3 py-1 hover:border-[#ff4a3d]"
                onClick={() => {
                  navigator.clipboard?.writeText(EMAIL);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
              >
                {copied ? "copied" : "copy"}
              </button>
              <a className="rounded-full border border-white/30 px-3 py-1 hover:border-[#ff4a3d]" href={`mailto:${EMAIL}`}>
                write
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
