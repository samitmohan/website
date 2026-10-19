"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ART, DRAWN } from "./things-art";

type Card = { text: string; art?: keyof typeof ART; img?: string; suit: string; red: boolean; rank: string };

const SUITS = [
  ["♠", false],
  ["♥", true],
  ["♣", false],
  ["♦", true],
] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const HAND = 7;

type Phase = "idle" | "gather" | "riffle" | "deal";

/**
 * The things-I-like list as a deck of cards. A hand of seven is dealt face
 * down in a fan; click a card to turn it over. Shuffle gathers the hand,
 * riffles, and deals the next seven, so the whole deck comes round before
 * anything repeats. "Pick a card" pulls one at random and shows it off.
 */
export function Deck({ things, photos = {}, snaps = {} }: { things: string[]; photos?: Record<string, string>; snaps?: Record<string, string[]> }) {
  const deck = useMemo<Card[]>(
    () =>
      things.map((text, i) => {
        const [suit, red] = SUITS[i % 4];
        return { text, art: DRAWN.find(([re]) => re.test(text))?.[1], img: photos[text], suit, red, rank: RANKS[Math.floor(i / 4) % 13] };
      }),
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
                    <Face c={c} />
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
            <div className="relative">
              <div className="deck-card deck-card--big animate-[card-reveal_.9s_cubic-bezier(.16,1,.3,1)_both]">
                <Face c={picked} />
              </div>
              <Snaps list={snaps[picked.text] ?? []} />
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

function Face({ c }: { c: Card }) {
  const ink = c.red ? "text-[#c8202a]" : "text-[#141414]";
  return (
    <div className="relative flex size-full flex-col rounded-[10px] bg-[#fbf8f2] p-2 text-left shadow-[0_8px_18px_-8px_rgba(0,0,0,.45)]">
      <span className={`card-rank font-serif text-[15px] leading-none ${ink}`}>
        {c.rank}
        <br />
        {c.suit}
      </span>
      <div className="card-art mx-auto -mt-2 w-[64%] [&>svg]:w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {c.img ? <img src={c.img} alt="" className="w-full" /> : c.art ? ART[c.art] : null}
      </div>
      <p className="card-text mt-auto line-clamp-4 font-serif text-[12.5px] leading-tight text-[#141414] italic">{c.text}</p>
      <span className={`absolute right-2 bottom-2 rotate-180 font-serif text-[15px] leading-none ${ink} opacity-0`}>{c.suit}</span>
    </div>
  );
}

/**
 * Little taped photos around an open card. Until a thing has photos in
 * THING_SNAPS, two empty frames show where they will go.
 */
function Snaps({ list }: { list: string[] }) {
  const spots = [
    // Phones tape them over the card's edges, clear of the corner index; wider screens beside it.
    "-right-3 -top-6 rotate-[6deg] sm:right-auto sm:-left-40 sm:top-8 sm:-rotate-[8deg]",
    "-left-3 top-[30%] -rotate-[7deg] sm:left-auto sm:-right-40 sm:top-28 sm:rotate-[6deg]",
    "-right-3 top-[52%] rotate-[5deg] sm:right-auto sm:-left-36 sm:top-auto sm:bottom-6",
  ];
  const items = list.length ? list.slice(0, 3) : [null, null];
  return (
    <>
      {items.map((src, i) => (
        <figure
          key={i}
          className={`absolute w-20 animate-[snap-in_.7s_cubic-bezier(.16,1,.3,1)_both] bg-[#fbf8f2] p-1.5 pb-4 shadow-[0_8px_18px_-8px_rgba(0,0,0,.5)] sm:w-36 ${spots[i]}`}
          style={{ animationDelay: `${0.35 + i * 0.12}s` }}
        >
          <span className="absolute -top-2 left-1/2 h-4 w-10 -translate-x-1/2 rotate-[-3deg] bg-[#f2e3c6]/80" />
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="aspect-square w-full object-cover" />
          ) : (
            <div className="grid aspect-square w-full place-items-center border border-dashed border-[#c9bfae] font-mono text-[10px] text-[#8d8b85]">photo</div>
          )}
        </figure>
      ))}
    </>
  );
}
