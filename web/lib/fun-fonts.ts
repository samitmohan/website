import { Fraunces, Newsreader } from "next/font/google";

// /fun (clairo-warm) fonts. Fraunces = soft, characterful display serif;
// Newsreader = cozy editorial body serif. Warm, analog, diary-like.
// Both are variable fonts. Naming explicit weights makes next/font fetch one
// static instance per weight/style pair, and Google 404s several of those
// italic URLs, which hard-fails the Vercel build. Omitting weight pulls the
// variable file instead: one request per style, full weight range.
export const funDisplay = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const funBody = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// Apply on the candy wrapper so scoped CSS can read the font vars.
export const funFontVars = `${funDisplay.variable} ${funBody.variable}`;
