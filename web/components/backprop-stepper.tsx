"use client";

import { useState, type ReactNode } from "react";

/**
 * The one interactive thing on the site.
 *
 * Nothing here moves on its own - the seven looping figures were the reason
 * the site read as a cartoon. But with the ambient motion gone there is room
 * for exactly one object that answers a click, and interaction reads as craft
 * where a loop reads as decoration. This figure is the candidate because it is
 * the only drawing whose subject is a sequence: a forward pass, a loss, and
 * gradients coming back the same way.
 *
 * It lives on /blog rather than on the homepage door. The door is a <Link>,
 * and a button inside a link is invalid markup and unusable with a keyboard -
 * clicking to step would also navigate. Splitting the door so the drawing
 * stops navigating would break the one idea the homepage has.
 *
 * The state is a class list on an ancestor of the inlined svg, which is an
 * ordinary element in the document, so globals.css does the revealing. That
 * keeps this component to a list of steps and a counter.
 *
 * `children` is the server-rendered <Figure>: it reads the file from public/
 * at build time and cannot be imported from a client component.
 */
const STEPS = [
  { on: "", caption: "click to step" },
  { on: "on-f0", caption: "forward · x → h₁" },
  { on: "on-f0 on-f1", caption: "forward · h₁ → h₂" },
  { on: "on-f0 on-f1 on-f2", caption: "forward · h₂ → ŷ" },
  { on: "on-f0 on-f1 on-f2 on-loss", caption: "loss" },
  { on: "on-f0 on-f1 on-f2 on-loss on-b2", caption: "backward · ∂L/∂h₂" },
  { on: "on-f0 on-f1 on-f2 on-loss on-b2 on-b1", caption: "backward · ∂L/∂h₁" },
  {
    on: "on-f0 on-f1 on-f2 on-loss on-b2 on-b1 on-b0",
    caption: "backward · ∂L/∂x",
  },
];

export function BackpropStepper({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);

  return (
    <div className="page-figure page-figure-blog bp-stepper">
      <button
        type="button"
        className={`bp-stage ${STEPS[step].on}`}
        aria-label="Backpropagation diagram: step through the forward and backward pass"
        onClick={() => setStep((n) => (n + 1) % STEPS.length)}
      >
        {children}
      </button>
      {/* Announced on each step, so the sequence is available without seeing
          which edges lit. */}
      <p className="bp-caption" aria-live="polite">
        {STEPS[step].caption}
      </p>
    </div>
  );
}
