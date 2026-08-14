import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { RSS_ALTERNATE } from "@/lib/metadata";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// The site is class-themed and ignores prefers-color-scheme, so a media-keyed
// themeColor would paint dark browser chrome around a light page for anyone on
// an OS dark theme who has not toggled. Ship the default here and let
// ThemeToggle rewrite it to track the theme actually in effect.
export const viewport: Viewport = {
  themeColor: "#FAFAFA",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://samitmohan.in"),
  title: {
    default: "Samit Mohan",
    template: "%s - Samit Mohan",
  },
  description: "AI Scientist at Beltech AI building computer-vision systems. I rebuild ML from scratch and write engineering blogs.",
  icons: {
    icon: "/favicon.svg",
  },
  alternates: {
    types: RSS_ALTERNATE,
  },
  openGraph: {
    title: "Samit Mohan",
    description: "AI Scientist at Beltech AI building computer-vision systems. I rebuild ML from scratch and write engineering blogs.",
    type: "website",
    siteName: "Samit Mohan",
    url: "https://samitmohan.in",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samit Mohan",
    description: "AI Scientist at Beltech AI building computer-vision systems. I rebuild ML from scratch and write engineering blogs.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
