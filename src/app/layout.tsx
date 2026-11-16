import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Stars from "@/components/Stars";
import PinLock from "@/components/PinLock";
import OfflineSync from "@/components/OfflineSync";
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
export const metadata: Metadata = { manifest: "/manifest.webmanifest", title: "Selah", description: "Mon journal de vie, de foi et de vision" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Stars /><PinLock /><OfflineSync />
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:pl-72 md:pr-8">{children}</main>
      </body>
    </html>
  );
}
