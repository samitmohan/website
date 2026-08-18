import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { THEME_SCRIPT } from "@/lib/theme-script";
import { RSS_ALTERNATE } from "@/lib/metadata";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// No viewport.themeColor export on purpose: THEME_SCRIPT owns the theme-color
// meta tag. Two writers on one tag means load order decides which wins, and the
// loser paints light browser chrome around a dark page.

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
      className={`${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Before first paint, so a stored dark preference never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
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
