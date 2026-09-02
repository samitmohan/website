import type { Metadata } from "next";
import { Instrument_Serif, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { RSS_ALTERNATE } from "@/lib/metadata";
import "./globals.css";

// The display face for the whole site: the "samit" wordmark and every heading,
// through --font-display in globals.css.
//
// A high-contrast serif, deliberately not a fourth attempt at handwriting:
// every mark around the name is already a brush drawing, so another hand in
// type was competing with them rather than sitting alongside. Refined type
// against rough ink is the contrast the page was missing.
//
// It was scoped to the wordmark alone on the argument that "a handwritten
// heading over a list of post titles reads as decoration". That argument is
// against a handwriting face, and this is not one - it was pointing at the
// wrong conclusion. The cost of the narrow scope was a site whose headings
// were all set in the same system sans as its body text, differing from the
// prose only in size, which is the most templated thing a page can do.
//
// preload stays on: this is now on the critical path for every route.
const instrumentSerif = Instrument_Serif({
  variable: "--font-mark",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// preload: false because the fonts declared here are preloaded on every route,
// and the homepage - the one page most people see first - sets nothing in mono.
// It was fetching 23 KB to render nothing. Where the mono does appear it carries
// dates, project names and source links, all inside boxes with a stated width
// (.post-date is 6.5rem), so it swaps in without moving anything.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

// The site is light-only, so the theme-color meta is a constant. It used to be
// written at runtime by a pre-paint script that read a stored preference; with
// one theme there is nothing to read and nothing to flash.
export const viewport = { themeColor: "#FFFDF8" };

export const metadata: Metadata = {
  metadataBase: new URL("https://samitmohan.in"),
  title: {
    default: "Samit Mohan",
    template: "%s - Samit Mohan",
  },
  description: "AI Scientist at Beltech AI in Bangalore. I rebuild ML from scratch and write about it.",
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    types: RSS_ALTERNATE,
  },
  openGraph: {
    title: "Samit Mohan",
    description: "AI Scientist at Beltech AI in Bangalore. I rebuild ML from scratch and write about it.",
    type: "website",
    siteName: "Samit Mohan",
    url: "https://samitmohan.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samit Mohan",
    description: "AI Scientist at Beltech AI in Bangalore. I rebuild ML from scratch and write about it.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-3 focus:py-1.5 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:text-[13px]"
        >
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Samit Mohan",
              url: "https://samitmohan.in",
              image: "https://samitmohan.in/photo.jpeg",
              jobTitle: "AI Scientist",
              worksFor: {
                "@type": "Organization",
                name: "Beltech AI",
                url: "https://beltech.ai",
              },
              email: "mailto:samitmohan@gmail.com",
              sameAs: [
                "https://github.com/samitmohan",
                "https://www.linkedin.com/in/samit-mohan/",
              ],
              alumniOf: {
                "@type": "CollegeOrUniversity",
                name: "New Horizon College of Engineering, VTU",
              },
              knowsAbout: [
                "Computer Vision",
                "Deep Learning",
                "PyTorch",
                "Machine Learning",
                "LLMs",
                "Inference Optimization",
              ],
            }),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
