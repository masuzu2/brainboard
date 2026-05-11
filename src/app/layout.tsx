import type { Metadata } from "next";
import { Caveat, Patrick_Hand, Inter } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

const patrickHand = Patrick_Hand({
  variable: "--font-patrick",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "brainboard — collaborative AI whiteboard",
  description:
    "An infinite, multiplayer whiteboard with AI superpowers. Sketch ideas, generate diagrams from text, and turn drawings into code.",
  openGraph: {
    title: "brainboard — collaborative AI whiteboard",
    description:
      "Infinite, multiplayer, AI-powered. Sketch → code. Text → diagram. Board → meeting notes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${caveat.variable} ${patrickHand.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
