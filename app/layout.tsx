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
  title: "Junior Rocketeers",
  description: "Blind wine tasting and grading app",
};

import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen relative`}
      >
        <div className="fixed inset-0 -z-10">
          <Image
            src="/background.png"
            alt="Winery Background"
            fill
            priority
            quality={100}
            className="object-cover object-center"
            unoptimized
          />
          <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" />
        </div>
        <div className="relative z-0 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
