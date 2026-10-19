import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Inter_Tight } from "next/font/google";
import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ThemeController } from "@/components/ThemeController";
import "./globals.css";

const sans = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inter-tight" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL("https://samitmohan.in"),
  title: { default: "Samit Mohan", template: "%s - Samit Mohan" },
  description: "Samit Mohan rebuilds ML from scratch and writes about it.",
  alternates: { types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", siteName: "Samit Mohan", images: ["/og/index.png"] },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
};

// Runs before first paint so a saved theme never flashes the other one.
const themeBoot = `try{var d=document.documentElement,t=localStorage.getItem("theme"),a=localStorage.getItem("accent");if(t==="dark"||t==="light")d.dataset.theme=t;if(a&&a!=="red")d.dataset.accent=a}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <ThemeController />
        <SmoothScroll />
        <Nav />
        {children}
      </body>
    </html>
  );
}
