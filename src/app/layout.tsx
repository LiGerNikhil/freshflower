import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { CartProvider } from "@/components/providers/CartContext";
import { WishlistProvider } from "@/components/providers/WishlistContext";
import { SiteChrome } from "@/components/sections/SiteChrome";
import { JsonLd } from "@/components/ui/JsonLd";
import { canonical, ORGANIZATION_LD } from "@/lib/seo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(canonical("/")),
  title: {
    default: "Premium flower delivery in Delhi NCR",
    template: "%s | FreshFlower.zone",
  },
  description:
    "Premium flower delivery, bouquets, and floral design across Delhi NCR — morning and same-day slots, gifting, weddings, and wholesale.",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "FreshFlower.zone",
    locale: "en_IN",
    url: canonical("/"),
    title: "FreshFlower.zone — Delhi NCR Florist",
    description:
      "Premium flower delivery, bouquets, and floral design across Delhi NCR.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FreshFlower.zone — Delhi NCR Florist",
    description:
      "Premium flower delivery, bouquets, and floral design across Delhi NCR.",
  },
  other: { "theme-color": "#FBF7F0" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <CartProvider>
          <WishlistProvider>
            <JsonLd data={ORGANIZATION_LD} />
            <SiteChrome>{children}</SiteChrome>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}