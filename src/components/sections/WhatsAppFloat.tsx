"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { waMeHref } from "@/lib/utils";

/**
 * Floating WhatsApp button (bottom-right). Reads the business WhatsApp number
 * from SiteContentProvider, so an admin edit in /admin/settings updates this
 * everywhere on the next visitor render.
 */
export function WhatsAppFloat() {
  const { settings } = useSiteContent();
  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    const timer = window.setTimeout(() => setVisible(true), 800);
    return () => window.clearTimeout(timer);
  }, []);

  const href = waMeHref(settings.whatsappNumber);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with us on WhatsApp (${settings.whatsappNumber})`}
      className={`fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
      <MessageCircle size={26} />
    </a>
  );
}