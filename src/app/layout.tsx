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

import { Outfit } from "next/font/google";
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-outfit",
});

import Script from "next/script";

export const metadata: Metadata = {
  title: "Herbalife OS - Экспертная платформа",
  description: "Автоматизированная система коррекции веса и здоровья",
};

import { TWAProvider } from "@/components/TWAProvider";
import { AuthProvider } from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-accent-bg text-graphite">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
        <AuthProvider>
          <TWAProvider>
            {children}
          </TWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
