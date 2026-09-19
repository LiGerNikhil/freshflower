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
  icons: {
    icon: [
      { url: "/assets/images/favicon/favicon.ico" },
      { url: "/assets/images/favicon/favicon.svg", type: "image/svg+xml" },
      {
        url: "/assets/images/favicon/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/assets/images/favicon/web-app-manifest-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/assets/images/favicon/web-app-manifest-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: [
      {
        url: "/assets/images/favicon/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  manifest: "/assets/images/favicon/site.webmanifest",
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
