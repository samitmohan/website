import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { RSS_ALTERNATE } from "@/lib/metadata";
import "./globals.css";

// Charter carries both the headings and the prose, so there is no display
// face declared here at all - it is self-hosted from public/fonts/ by two
// @font-face blocks at the top of globals.css, which is also where the licence
// note explaining why the files may be committed lives.
//
// This used to load Instrument Serif for --font-display. It is a high-contrast
// display serif, and a high-contrast serif over a cream ground is the pairing
// every generated page arrives with; Charter is a text face from 1987 drawn for
// 300dpi laser printers, which is a different and older idea about what type on
// a screen is for. Dropping it also drops a Google Fonts request from every
// route.

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

// One entry per scheme, so the browser chrome matches whichever theme is
// showing. Next emits two <meta name="theme-color"> with media attributes.
export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0C09" },
  ],
};

// Read before first paint, so an explicit choice never flashes the other
// theme. Nothing here touches the DOM beyond documentElement.dataset, and with
// no stored value it does nothing at all - the CSS media query already handles
// following the OS. Inline and blocking on purpose: any deferral is the flash.
const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL("https://samitmohan.in"),
  title: {
    default: "Samit Mohan",
    template: "%s - Samit Mohan",
  },
  description: "AI Scientist at Beltech AI in Bangalore. I rebuild ML from scratch and write about it.",
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
      className={`${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-3 focus:py-1.5 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:text-small"
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
