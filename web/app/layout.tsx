import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Samit Mohan",
  description: "ML/AI engineer at beltech.ai. Building CV systems, writing about ML, teaching from first principles.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Samit Mohan",
    description: "ML/AI engineer at beltech.ai. Building CV systems, writing about ML, teaching from first principles.",
    type: "website",
    siteName: "Samit Mohan",
    url: "https://samitmohan.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Samit Mohan",
    description: "ML/AI engineer at beltech.ai. Building CV systems, writing about ML, teaching from first principles.",
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
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
