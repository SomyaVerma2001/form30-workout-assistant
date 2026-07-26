import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const somsySerif = Cormorant_Garamond({
  variable: "--font-somsy-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://form30-workout-assistant.vsomya27.chatgpt.site"),
  title: "Somsy — My Private Movement Ritual",
  description:
    "Somsy’s private 30-day movement ritual with guided workouts, daily weight check-ins and a personal progress ledger.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Somsy — My Private Movement Ritual",
    description:
      "A private home for Somsy’s daily movement, weight and progress.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Somsy — My Private Movement Ritual",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Somsy — My Private Movement Ritual",
    description: "A private home for Somsy’s daily movement, weight and progress.",
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
      <body className={`${geistSans.variable} ${geistMono.variable} ${somsySerif.variable}`}>
        {children}
      </body>
    </html>
  );
}
