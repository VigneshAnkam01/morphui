import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Morphui — Sketch to UI in Seconds",
  description:
    "Upload any wireframe, napkin sketch, or whiteboard drawing. Get clean, production-ready HTML, Tailwind, or React code instantly. Powered by Claude AI vision.",
  keywords: ["AI", "UI generator", "sketch to code", "wireframe to code", "Claude AI", "React", "Tailwind", "design to code"],
  openGraph: {
    title: "Morphui — Sketch to UI in Seconds",
    description: "Turn any sketch into production UI code with AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
