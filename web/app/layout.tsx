import type { Metadata } from "next";
import { Caveat, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { RSS_ALTERNATE } from "@/lib/metadata";
import "./globals.css";

// The one display face on the site, and it is only ever used by three things:
// the "samit" wordmark, the two door labels, and the /about heading. The sm
// monogram beside it is not type at all - it is the original chalk drawing,
// traced (public/marks/sm.svg) - so this is chosen to sit next to that hand
// rather than to reproduce it. Actual handwriting rather than a marker face:
// the marks around it are already brush drawings, so a second brush in type
// competed with them instead of sitting alongside.
//
// It is used ONLY by the wordmark and the two door labels on the homepage.
// /blog and /projects set their headings in the page's own face - a
// handwritten heading over a list of post titles reads as decoration.
const caveat = Caveat({
  variable: "--font-mark",
  subsets: ["latin"],
  weight: "700",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// The site is light-only, so the theme-color meta is a constant. It used to be
// written at runtime by a pre-paint script that read a stored preference; with
// one theme there is nothing to read and nothing to flash.
export const viewport = { themeColor: "#FAFAFA" };

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
      className={`${geistMono.variable} ${caveat.variable} h-full antialiased`}
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
