"use client";

import { useState } from "react";
import {
  Camera,
  Check,
  Clock,
  KeyRound,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
  Truck,
  WandSparkles,
} from "lucide-react";
import { useSiteContent } from "@/components/providers/SiteContentProvider";
import { telHref, waMeHref } from "@/lib/utils";
import type { BusinessSettings } from "@/lib/types";

export function SettingsManager() {
  const { settings, setSettings, userPasswords, setUserPassword } = useSiteContent();
  const [draft, setDraft] = useState<BusinessSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  const current = draft ?? settings;

  const patch = (patch: Partial<BusinessSettings>) =>
    setDraft({ ...current, ...patch });

  const updateHours = (index: number, field: "label" | "value", value: string) => {
    const businessHours = current.businessHours.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    setDraft({ ...current, businessHours });
  };

  const addHoursRow = () =>
    setDraft({
      ...current,
      businessHours: [...current.businessHours, { label: "", value: "" }],
    });

  const handleSave = () => {
    setSettings(current);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  const handlePasswordChange = () => {
    if (!currentPw) {
      setPwError("Current password is required.");
      return;
    }
    if (currentPw !== (userPasswords["ayush.parmar@freshflower.zone"] ?? "")) {
      setPwError("Current password is incorrect.");
      return;
    }
    if (newPw.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    setUserPassword("ayush.parmar@freshflower.zone", newPw);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwError("");
    setShowPasswordChange(false);
    setPwSaved(true);
    window.setTimeout(() => setPwSaved(false), 1400);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            <Settings size={13} /> Settings
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            Business settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            One source of truth for contact details, hours and delivery notes.
            Saved values power the floating WhatsApp button, the site nav &
            footer, and the contact page.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Check size={15} /> {saved ? "Saved ✓" : "Save settings"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          {/* Contact */}
          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <Phone size={16} className="text-gold" /> Contact details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Phone (display + tel:)
                </label>
                <input
                  type="text"
                  value={current.phoneNumber}
                  onChange={(event) => patch({ phoneNumber: event.target.value })}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="+91 85069 51873"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  WhatsApp number
                  <span className="ml-1 normal-case text-gold">· powers the float button</span>
                </label>
                <input
                  type="text"
                  value={current.whatsappNumber}
                  onChange={(event) => patch({ whatsappNumber: event.target.value })}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  placeholder="+91 85069 51873"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Email
                </label>
                <input
                  type="email"
                  value={current.email}
                  onChange={(event) => patch({ email: event.target.value })}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Instagram handle
                </label>
                <input
                  type="text"
                  value={current.instagramHandle}
                  onChange={(event) => patch({ instagramHandle: event.target.value })}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Instagram URL
                </label>
                <input
                  type="url"
                  value={current.instagramUrl}
                  onChange={(event) => patch({ instagramUrl: event.target.value })}
                  placeholder="https://www.instagram.com/your-profile"
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-soft">
                  <MapPin size={12} className="text-gold" /> Address
                </label>
                <input
                  type="text"
                  value={current.addressLine}
                  onChange={(event) => patch({ addressLine: event.target.value })}
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* Hours */}
          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Clock size={16} className="text-gold" /> Business hours
              </h2>
              <button
                type="button"
                onClick={addHoursRow}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-ink/20 px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
              >
                <WandSparkles size={12} /> Add row
              </button>
            </div>
            <div className="space-y-3">
              {current.businessHours.map((row, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(event) => updateHours(index, "label", event.target.value)}
                    placeholder="Mon – Sat"
                    className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={row.value}
                    onChange={(event) => updateHours(index, "value", event.target.value)}
                    placeholder="6:00 AM – 9:00 PM"
                    className="rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...current,
                        businessHours: current.businessHours.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                    aria-label={`Remove hours row ${index + 1}`}
                    className="rounded-md border border-ink/10 px-2 text-ink-soft transition hover:border-red-300 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery + newsletters */}
          <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <Truck size={16} className="text-gold" /> Delivery notes
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Porter note (cart / checkout)
                </label>
                <textarea
                  value={current.porterNote}
                  onChange={(event) => patch({ porterNote: event.target.value })}
                  rows={2}
                  className="w-full resize-y rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                  Delivery charge note
                </label>
                <input
                  type="text"
                  value={current.deliveryChargeNote}
                  onChange={(event) =>
                    patch({ deliveryChargeNote: event.target.value })
                  }
                  className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Live contact view */}
        <section className="h-fit rounded-xl border border-ink/10 bg-ivory-deep/50 p-6 shadow-sm">
          <h2 className="mb-4 font-display text-xl">Live contact view</h2>
          <div className="space-y-3 text-sm text-ink-soft">
            <p className="flex items-center gap-2">
              <Phone size={13} className="text-gold" />
              <a href={telHref(current.phoneNumber)} className="text-ink hover:underline">
                {current.phoneNumber}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <MessageCircle size={13} className="text-gold" />
              <a href={waMeHref(current.whatsappNumber)} className="text-ink hover:underline">
                wa.me {current.whatsappNumber}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={13} className="text-gold" />
              <a href={`mailto:${current.email}`} className="text-ink hover:underline">
                {current.email}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Camera size={13} className="text-gold" />
              {current.instagramHandle}
              {current.instagramUrl ? (
                <a
                  href={current.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline-offset-2 hover:underline"
                >
                  visit
                </a>
              ) : null}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center rounded-xl bg-ivory py-10">
            <a
              href={waMeHref(current.whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Floating WhatsApp button"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg"
            >
              <MessageCircle size={26} />
            </a>
          </div>
           <p className="mt-3 text-center text-xs text-ink-soft">
             Floating WhatsApp button — bottom-right of every public page.
           </p>
         </section>

         <section className="rounded-xl border border-ink/10 bg-white/80 p-6 shadow-sm">
           <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
             <KeyRound size={16} className="text-gold" /> Security
           </h2>
           <p className="mb-4 text-sm text-ink-soft">
             Keep your admin password secure. Change it here if needed.
           </p>
           {!showPasswordChange ? (
             <button
               type="button"
               onClick={() => setShowPasswordChange(true)}
               className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
             >
               <KeyRound size={15} /> Change password
             </button>
           ) : (
             <div className="space-y-4">
               <div>
                 <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                   Current password
                 </label>
                 <input
                   type="password"
                   value={currentPw}
                   onChange={(e) => setCurrentPw(e.target.value)}
                   className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                   placeholder="Current password"
                 />
               </div>
               <div>
                 <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                   New password
                 </label>
                 <input
                   type="password"
                   value={newPw}
                   onChange={(e) => setNewPw(e.target.value)}
                   className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                   placeholder="New password (min 6 chars)"
                 />
               </div>
               <div>
                 <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                   Confirm new password
                 </label>
                 <input
                   type="password"
                   value={confirmPw}
                   onChange={(e) => setConfirmPw(e.target.value)}
                   className="w-full rounded-md border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none"
                   placeholder="Confirm new password"
                 />
               </div>
               {pwError && (
                 <p className="text-xs text-red-600">{pwError}</p>
               )}
               {pwSaved && (
                 <p className="text-xs text-sage-ink">
                   <Check size={14} className="inline mr-1" /> Password
                   updated.
                 </p>
               )}
               <div className="flex items-center gap-3">
                 <button
                   type="button"
                   onClick={handlePasswordChange}
                   className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition hover:bg-ink-soft"
                 >
                   <Check size={15} /> Save password
                 </button>
                 <button
                   type="button"
                   onClick={() => {
                     setShowPasswordChange(false);
                     setCurrentPw("");
                     setNewPw("");
                     setConfirmPw("");
                     setPwError("");
                   }}
                   className="rounded-md border border-ink/10 px-4 py-2 text-sm text-ink-soft transition hover:bg-ink/5"
                 >
                   Cancel
                 </button>
               </div>
             </div>
           )}
         </section>
       </div>
     </div>
   );
}