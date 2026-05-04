import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Header from "./components/header";
import ScrollToTop from "./components/ScrollToTop";

import { Toaster } from "@/components/ui/sonner";
import { VisualizerProvider } from "./context/visualizer";
import { LanguageProvider } from "./context/changeLanguage";

const GoudosFont = localFont({
  src: "../public/fonts/goudos.ttf",
  variable: "--font-Sorts-Mill",
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Via Wind",
  description: "",
  icons: {
    icon: "/images/LOGO/Logo-06.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className=" scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${GoudosFont.variable} ${raleway.variable} antialiased portBody`}
      >
          <div className="mainContainer">
        <VisualizerProvider>
        <LanguageProvider>
            <ScrollToTop />
            <Header />
            {children}
            <Toaster />
        </LanguageProvider>
        </VisualizerProvider>
          </div>
      </body>
    </html>
  );
}
