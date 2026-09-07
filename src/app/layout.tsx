import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { BUSINESS } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    template: `%s | ${BUSINESS.name}`,
  },
  description:
    "Giftedhands Salon SA is the home of no pain braiding in Centurion and Fourways. Knotless braids, goddess braids, French curl, Riverlocks, twists, scalp treatments and lashes — book your slot online in seconds. House calls available.",
  keywords: [
    "braids Centurion",
    "knotless braids Pretoria",
    "goddess braids Fourways",
    "no pain braiding",
    "French curl braids",
    "Riverlocks",
    "braiding salon Gauteng",
    "Giftedhands Salon",
  ],
  openGraph: {
    title: `${BUSINESS.name} — ${BUSINESS.tagline}`,
    description:
      "Pain-free knotless braids, goddess braids, twists and more in Centurion & Fourways. Book online.",
    type: "website",
    locale: "en_ZA",
    siteName: BUSINESS.name,
    images: [{ url: "/images/hero.jpg", width: 1024, height: 1536 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1310",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <WhatsAppButton />
      </body>
    </html>
  );
}
