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
  title: "Chroma — MIDI Visualizer",
  description: "A clean, modern MIDI visualizer and player for piano performances.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassName = `${geistSans.variable} ${geistMono.variable} antialiased`;
  
  return (
    <html lang="en">
      <body className={bodyClassName}>
        {children}
      </body>
    </html>
  );
}
