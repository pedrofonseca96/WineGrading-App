import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

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
        <LanguageProvider>
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

          {/* Language Toggle - Top Right */}
          <div className="fixed top-4 right-4 z-50">
            <LanguageToggle />
          </div>

          <div className="relative z-0 min-h-screen">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
