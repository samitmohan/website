import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { GridLines } from "@/components/GridLines";
import { Nav } from "@/components/Nav";
import { ThemeController } from "@/components/ThemeController";
import { ThemeRail } from "@/components/ThemeRail";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter-tight" });
// Only the body font is preloaded: preloads share the first round trips with the stylesheet,
// and these two swap in a moment later without blocking paint.
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", preload: false });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://samitmohan.in"),
  title: { default: "Samit Mohan", template: "%s - Samit Mohan" },
  description: "Samit Mohan rebuilds ML from scratch and writes about it.",
  alternates: { canonical: "/", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", siteName: "Samit Mohan", images: ["/og/index.png"] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

// Runs before first paint so a saved theme never flashes the other one.
const themeBoot = `try{var d=document.documentElement,t=localStorage.getItem("theme"),a=localStorage.getItem("accent");if(t==="light")d.dataset.theme=t;if(["light-green","ubuntu","vader","blonde"].indexOf(a)>-1)d.dataset.accent=a}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <GridLines />
        <ThemeController />
        <Nav />
        <ThemeRail />
        {children}
      </body>
    </html>
  );
}
