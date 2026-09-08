import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-ink px-5 py-14 text-ivory md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="font-display text-2xl">
              freshflower<span className="text-gold">.zone</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-ivory/55">
              Premium flowers for Delhi NCR, delivered with care — while the
              morning still feels yours.
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href="tel:+919999999999"
                aria-label="Call us"
                className="rounded-full border border-ivory/15 p-3 text-ivory/70 transition hover:border-gold hover:text-gold"
              >
                <Phone size={16} />
              </a>
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp us"
                className="rounded-full border border-ivory/15 p-3 text-ivory/70 transition hover:border-gold hover:text-gold"
              >
                <MessageCircle size={16} />
              </a>
              <a
                href="mailto:hello@freshflower.zone"
                aria-label="Email us"
                className="rounded-full border border-ivory/15 p-3 text-ivory/70 transition hover:border-gold hover:text-gold"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">
              Shop
            </p>
            <nav className="mt-5 grid gap-3 text-sm text-ivory/60">
              <Link href="/flowers" className="transition hover:text-ivory">
                All flowers
              </Link>
              <Link href="/bouquets" className="transition hover:text-ivory">
                Bouquets
              </Link>
              <Link href="/categories" className="transition hover:text-ivory">
                Categories
              </Link>
              <Link href="/occasions" className="transition hover:text-ivory">
                Occasions
              </Link>
              <Link href="/cart" className="transition hover:text-ivory">
                Your cart
              </Link>
            </nav>
          </div>

          {/* Flower delivery */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">
              Flower delivery
            </p>
            <nav className="mt-5 grid gap-3 text-sm text-ivory/60">
              <Link href="/flower-delivery-delhi" className="transition hover:text-ivory">
                Delhi
              </Link>
              <Link href="/flower-delivery-gurgaon" className="transition hover:text-ivory">
                Gurgaon
              </Link>
              <Link href="/flower-delivery-noida" className="transition hover:text-ivory">
                Noida
              </Link>
              <Link href="/flower-delivery-greater-noida" className="transition hover:text-ivory">
                Greater Noida
              </Link>
              <Link href="/flower-delivery-ghaziabad" className="transition hover:text-ivory">
                Ghaziabad
              </Link>
              <Link href="/flower-delivery-faridabad" className="transition hover:text-ivory">
                Faridabad
              </Link>
              <Link href="/birthday-flowers" className="transition hover:text-ivory">
                Birthday flowers
              </Link>
              <Link href="/anniversary-flowers" className="transition hover:text-ivory">
                Anniversary flowers
              </Link>
            </nav>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">
              Company
            </p>
            <nav className="mt-5 grid gap-3 text-sm text-ivory/60">
              <Link href="/about" className="transition hover:text-ivory">
                About us
              </Link>
              <Link href="/wholesale" className="transition hover:text-ivory">
                Wholesale
              </Link>
              <Link href="/wedding-events" className="transition hover:text-ivory">
                Wedding & events
              </Link>
              <Link href="/reviews" className="transition hover:text-ivory">
                Reviews
              </Link>
              <Link href="/blog" className="transition hover:text-ivory">
                Blog
              </Link>
              <Link href="/delivery" className="transition hover:text-ivory">
                Delivery info
              </Link>
              <Link href="/track-order" className="transition hover:text-ivory">
                Track order
              </Link>
              <Link href="/faq" className="transition hover:text-ivory">
                FAQ
              </Link>
              <Link href="/contact" className="transition hover:text-ivory">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact + policies */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">
              Contact
            </p>
            <div className="mt-5 space-y-3 text-sm text-ivory/60">
              <p className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-gold" />
                <a href="tel:+919999999999" className="hover:text-ivory">
                  +91 99999 99999
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-gold" />
                <a href="mailto:hello@freshflower.zone" className="hover:text-ivory">
                  hello@freshflower.zone
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 text-gold" />
                Delhi NCR, India
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="shrink-0 text-gold" />
                Mon–Sat 6 AM–8 PM
              </p>
            </div>
            <div className="mt-6 border-t border-ivory/15 pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-soft">
                Policies
              </p>
              <nav className="mt-3 grid gap-2 text-xs text-ivory/55 sm:grid-cols-2">
                <Link href="/privacy-policy" className="hover:text-ivory">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-ivory">
                  Terms
                </Link>
                <Link href="/refund-policy" className="hover:text-ivory">
                  Refunds
                </Link>
                <Link href="/delivery-policy" className="hover:text-ivory">
                  Delivery policy
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-ivory/15 pt-6 text-xs text-ivory/45 md:flex-row">
          <p>© {new Date().getFullYear()} FreshFlower.zone. All rights reserved.</p>
          <p>Made with care in Delhi NCR, India.</p>
        </div>
      </div>
    </footer>
  );
}
