import type { Run } from "@/components/TypedBio";

export const BIO: Run[] = [{ text: "I rebuild models from scratch, and run inference at scale on 300 cameras 24/7." }];

/** The posts the home page leads with, in this order. */
export const FEATURED = ["math", "paper", "microgpt", "attention-residuals"];

export const HANDLE = "samitmohan";
export const EMAIL = "samitmohan@gmail.com";

/**
 * Samit's photo for each thing: it is the card's face. Keyed by the exact
 * bullet text. Each lives in public/things/ with a 360px copy in
 * public/things/sm/. The things page fails the build on a key that matches no
 * bullet or a missing file.
 */
export const THING_PHOTOS: Record<string, string> = {
  "when people explain things from first principles": "/things/when-people-explain-first-principles.webp",
  "performing card tricks": "/things/card-magic.webp",
  "winning at uno": "/things/uno.webp",
  "finishing the final chapter of a novel": "/things/final-chapter.webp",
  "walking barefoot on grass": "/things/walk-barefoot-grass.webp",
  "reading Fantastic Mr. Fox": "/things/fantastic-mr-fox.webp",
  "maa’s mutton biryani": "/things/maa.webp",
  "survival instinct kicking in while working out": "/things/workingout.webp",
  "filing my nails, smoothing out the little edges": "/things/filing-nails.webp",
  "wearing funky socks": "/things/funky-socks.webp",
  "cheek kisses": "/things/cheek-kiss.webp",
  "removing glasses and rubbing my eyes": "/things/rubbing-my-eyes.webp",
  "resting my head on maa’s lap": "/things/maa-lap.webp",
  "vintage items": "/things/vintage-items.webp",
  "uncontrollably laughing on the floor with friends at 4am": "/things/laughing-on-floor.webp",
  "ps2 booting up and going past the loading screen on the first try": "/things/ps2.webp",
  "vinyl records": "/things/vinyl-2.webp",
  "gunshot sound of kicks hitting the bag": "/things/gunshot.webp",
  "mechanical pencils": "/things/mechanical-pencils.webp",
  "writing on a whiteboard": "/things/whiteboard.webp",
  "bangalore weather": "/things/bangalore-weather.webp",
  "watching people i care about achieve goals and overcome their biggest insecurities": "/things/watching-people-i-care-about.webp",
  "standing in a bookstore, staring": "/things/bookstore-staring.webp",
  "ap bhavan ashoka road 110001": "/things/ap-bhawan.webp",
  "pecos mg road 560001": "/things/pecos-mg-road.webp",
  "writing things down": "/things/writing-things-down.webp",
  "exclamation marks in pairs !!": "/things/exclamation-mark-pair.webp",
  "converse chuck taylors": "/things/chuck-taylors.webp",
  "sound of clickity clack when i type fast": "/things/type-fast.webp",
  "shirts & ties": "/things/shirt-tie.webp",
  "walking in cubbon park": "/things/walking-cubbon-park.webp",
  "eerie feeling when i play black sabbath or hendrix": "/things/sabbath.webp",
  "first sip of beer; goes straight to heart": "/things/beer.webp",
  "davidoff espresso 57 in the morning; yum": "/things/espresso-57.webp",
  "sitting in other people's living rooms": "/things/sitting-in-living-room.webp",
};

/** The live widgets in public/widgets, and the posts they were built for. */
export const LAB = [
  { id: "microgpt-stepper", name: "microGPT stepper", blurb: "Step a tiny GPT one token at a time.", post: "microgpt" },
  { id: "vllm-batching", name: "continuous batching", blurb: "Watch vLLM pack requests into a batch.", post: "inference" },
  { id: "residual-growth", name: "residual growth", blurb: "How the residual stream norm grows with depth.", post: "attention-residuals" },
  { id: "lru-fib", name: "lru_cache vs fib", blurb: "The recursion tree, with and without the cache.", post: "pythontricks" },
];
