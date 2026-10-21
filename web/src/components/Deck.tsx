"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ART, DRAWN } from "./things-art";

type Card = { text: string; art?: keyof typeof ART; img?: string };

const HAND = 7;

type Phase = "idle" | "gather" | "riffle" | "deal";

/**
 * The things-I-like list as a deck of cards. A hand of seven is dealt face
 * down in a fan; click a card to turn it over. Each face is Samit's photo of
 * the thing (a drawing stands in for a thing with no photo yet). Shuffle gathers the hand,
 * riffles, and deals the next seven, so the whole deck comes round before
 * anything repeats. "Pick a card" pulls one at random and shows it off.
 */
export function Deck({ things, photos = {} }: { things: string[]; photos?: Record<string, string> }) {
  const deck = useMemo<Card[]>(
    () => things.map((text) => ({ text, art: DRAWN.find(([re]) => re.test(text))?.[1], img: photos[text] })),
    [things, photos],
  );
  const order = useMemo(() => {
    // A fixed shuffle so the first hand is the same for everyone, and stable across renders.
    const idx = deck.map((_, i) => i);
    let s = 11;
    for (let i = idx.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return idx;
  }, [deck]);

  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>("deal");
  const [up, setUp] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<Card | null>(null);
  const [live, setLive] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const still = useRef(false);

  const hands = Math.ceil(deck.length / HAND);
  const hand = Array.from({ length: HAND }, (_, i) => deck[order[((round % hands) * HAND + i) % deck.length]]);

  useEffect(() => {
    if (!picked) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPicked(null);
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [picked]);

  useEffect(() => {
    still.current = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setPhase("idle"), still.current ? 0 : 900);
    return () => {
      clearTimeout(t);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, still.current ? 0 : ms));

  const shuffle = () => {
    if (phase !== "idle") return;
    setPicked(null);
    setPhase("gather");
    later(() => setPhase("riffle"), 380);
    later(() => {
      setUp(new Set());
      setRound((r) => r + 1);
      setPhase("deal");
    }, 1250);
    later(() => setPhase("idle"), 2150);
  };

  const pick = () => {
    if (phase !== "idle") return;
    const c = deck[Math.floor(Math.random() * deck.length)];
    setPicked(null);
    later(() => {
      setPicked(c);
      setLive(c.text);
    }, 60);
  };

  const flip = (i: number) => {
    if (phase !== "idle") return;
    if (up.has(i)) {
      setPicked(hand[i]);
      return;
    }
    setUp((s) => new Set(s).add(i));
    setLive(hand[i].text);
    later(() => setPicked(hand[i]), 520);
  };

  // Fan geometry: an arc of seven, centred, gathered to one stack between hands.
  const fan = (i: number) => {
    const mid = (HAND - 1) / 2, k = i - mid;
    if (phase === "gather" || phase === "riffle") return `translate(-50%, 0) rotate(0deg)`;
    return `translate(calc(-50% + ${k} * var(--spread)), ${k * k * 5}px) rotate(calc(${k} * var(--tilt)))`;
  };

  return (
    <div className="relative">
      <div className="text-center">
        <h2 className="font-serif text-[clamp(40px,7vw,64px)] leading-none font-normal">Things I like</h2>
      </div>

      <div className="relative mx-auto mt-8 h-[330px] max-w-[620px] [--spread:min(30px,calc((100vw_-_198px)_/_6))] [--tilt:5deg] max-[379px]:[--tilt:3.5deg] sm:h-[360px] sm:[--spread:64px] sm:[--tilt:7deg]" style={{ perspective: "1400px" }}>
        {/* the riffle: two half-stacks that split apart and fall back together */}
        {phase === "riffle" &&
          Array.from({ length: 12 }, (_, j) => (
            <div
              key={j}
              className="deck-card absolute top-6 left-1/2"
              style={{
                animation: `riffle-${j % 2 ? "r" : "l"} 820ms cubic-bezier(.5,0,.3,1) both`,
                animationDelay: `${(j >> 1) * 28}ms`,
                zIndex: j,
              }}
            >
              <Back />
            </div>
          ))}

        {phase !== "riffle" &&
          hand.map((c, i) => (
            <button
              key={`${round}-${i}`}
              type="button"
              onClick={() => flip(i)}
              aria-label={up.has(i) ? c.text : `card ${i + 1}, face down`}
              className="deck-card group absolute top-6 left-1/2 origin-[50%_120%] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
              style={{
                transform: fan(i),
                transitionDelay: phase === "deal" ? `${i * 70}ms` : "0ms",
                zIndex: i,
                animation: phase === "deal" ? `deal-in 600ms cubic-bezier(.16,1,.3,1) ${i * 70}ms both` : undefined,
              }}
            >
              <div className="relative size-full transition-transform duration-300 group-hover:-translate-y-5">
                <div
                  className="relative size-full transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{ transform: up.has(i) ? "rotateY(180deg)" : "none" }}
                >
                  <div className="absolute inset-0 [backface-visibility:hidden]">
                    <Back />
                  </div>
                  <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    {/* A face-down card has nothing to show yet, so its photo waits until it turns over. */}
                    {up.has(i) && <Face c={c} />}
                  </div>
                </div>
              </div>
            </button>
          ))}
      </div>

      <div className="flex justify-center gap-2">
        <button type="button" className="pill" onClick={shuffle} disabled={phase !== "idle"}>
          shuffle
        </button>
        <button type="button" className="pill" onClick={pick} disabled={phase !== "idle"}>
          pick a card
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      {picked && (
        <div className="fixed inset-0 z-[70] grid animate-[fade-in_.2s_both] place-items-center overflow-y-auto bg-black/35 p-4 backdrop-blur-[2px]" onClick={() => setPicked(null)}>
          <div className="flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={picked.text}>
            <div className="deck-card deck-card--big animate-[card-reveal_.9s_cubic-bezier(.16,1,.3,1)_both]">
              <Face c={picked} big />
            </div>
            <div className="flex gap-2">
              <button type="button" className="pill" onClick={pick} autoFocus>
                another
              </button>
              <button type="button" className="pill" onClick={() => setPicked(null)}>
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Back() {
  return (
    <div className="size-full rounded-[10px] border-[5px] border-paper bg-accent shadow-[0_8px_18px_-8px_rgba(0,0,0,.45)]">
      <div
        className="size-full rounded-[5px] opacity-35"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--paper) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, var(--paper) 0 2px, transparent 2px 9px)" }}
      />
    </div>
  );
}

/** A photo card: the photo fills the face, the line from the post sits under it. */
function Face({ c, big = false }: { c: Card; big?: boolean }) {
  // The hand's cards are 150px wide at most; they load the 360px copy.
  const src = c.img && (big ? c.img : c.img.replace("/things/", "/things/sm/"));
  return (
    <div className="flex size-full flex-col gap-1.5 rounded-[10px] bg-[#fbf8f2] p-1.5 text-left shadow-[0_8px_18px_-8px_rgba(0,0,0,.45)]">
      <div className="card-photo relative min-h-0 flex-1 overflow-hidden rounded-[6px] bg-[#ece6da]">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        ) : (
          c.art && <div className="grid size-full place-items-center p-3 [&>svg]:w-[80%]">{ART[c.art]}</div>
        )}
      </div>
      <p className="card-text line-clamp-3 px-0.5 pb-0.5 font-serif text-[12.5px] leading-tight text-[#141414] italic">{c.text}</p>
    </div>
  );
}
