import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://form30.work"),
  title: "FORM30 — Your 30-Day Home Workout Coach",
  description:
    "A guided 30-day bodyweight workout plan with exercise demonstrations, smart timers, rest cues and saved progress.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "FORM30 — 30 Days. Zero Equipment.",
    description:
      "Press play on a progressive home workout plan that handles every exercise, interval and rest.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "FORM30 — Your Body. Your 30 Days.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FORM30 — 30 Days. Zero Equipment.",
    description: "Your guided bodyweight workout coach.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
