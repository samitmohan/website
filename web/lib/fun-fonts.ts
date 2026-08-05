import { Fraunces, Newsreader } from "next/font/google";

// /fun (clairo-warm) fonts. Fraunces = soft, characterful display serif;
// Newsreader = cozy editorial body serif. Warm, analog, diary-like.
export const funDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const funBody = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

// Apply on the candy wrapper so scoped CSS can read the font vars.
export const funFontVars = `${funDisplay.variable} ${funBody.variable}`;
