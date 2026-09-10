import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { CartProvider } from "@/components/providers/CartContext";
import { WishlistProvider } from "@/components/providers/WishlistContext";
import { SiteContentProvider } from "@/components/providers/SiteContentProvider";
import { SiteChrome } from "@/components/sections/SiteChrome";
import { JsonLd } from "@/components/ui/JsonLd";
import {
  canonical,
  DEFAULT_KEYWORDS,
  openGraphImage,
  ORGANIZATION_LD,
} from "@/lib/seo";
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
    default: "Flower Delivery Delhi NCR — Same Morning & Same Day | FreshFlower.zone",
    template: "%s | FreshFlower.zone",
  },
  description:
    "Premium flower delivery, bouquets, and floral design across Delhi NCR — morning and same-day slots, gifting, weddings, and wholesale.",
  keywords: DEFAULT_KEYWORDS,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "FreshFlower.zone",
    locale: "en_IN",
    url: canonical("/"),
    title: "FreshFlower.zone — Flower Delivery Delhi NCR",
    description:
      "Premium flower delivery, bouquets, and floral design across Delhi NCR — morning and same-day slots, gifting, weddings, and wholesale.",
    images: openGraphImage(),
  },
  twitter: {
    card: "summary_large_image",
    title: "FreshFlower.zone — Flower Delivery Delhi NCR",
    description:
      "Premium flower delivery, bouquets, and floral design across Delhi NCR.",
    images: openGraphImage(),
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
            <SiteContentProvider>
              <JsonLd data={ORGANIZATION_LD} />
              <SiteChrome>{children}</SiteChrome>
            </SiteContentProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}