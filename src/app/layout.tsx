import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource-variable/inter";
import "./globals.css";
import Nav from "@/components/Nav";
import Stars from "@/components/Stars";
import PinLock from "@/components/PinLock";
import OfflineSync from "@/components/OfflineSync";
import Feedback from "@/components/Feedback";

export const metadata: Metadata = { manifest: "/manifest.webmanifest", title: "Selah", description: "Mon journal de vie, de foi et de vision" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Stars /><PinLock /><OfflineSync /> <Feedback />
        <Nav />
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-8 md:pl-72 md:pr-8">{children}</main>
      </body>
    </html>
  );
}