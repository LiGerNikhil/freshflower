"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    console.log("TODO Phase 9: POST contact enquiry to the real API", payload);
    setSent(true);
    event.currentTarget.reset();
  };
  if (sent)
    return (
      <div className="rounded-lg bg-sage p-8">
        <Check className="text-sage-ink" />
        <h2 className="mt-4 font-display text-3xl">Message received.</h2>
        <p className="mt-2 text-sm text-ink-soft">
          We&apos;ll get back to you during business hours.
        </p>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-xl bg-white/70 p-6 md:grid-cols-2"
    >
      <Field name="name" label="Name" required />
      <Field name="phone" label="Phone" type="tel" required />
      <Field name="email" label="Email" type="email" required />
      <Field name="subject" label="Subject" required />
      <label className="text-sm font-semibold md:col-span-2">
        Message
        <textarea
          required
          name="message"
          rows={5}
          className="mt-2 w-full rounded-md border border-ink/10 bg-ivory/70 p-3 text-sm"
        />
      </label>
      <Button type="submit" size="lg" className="md:col-span-2">
        Send message
      </Button>
    </form>
  );
}
function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full rounded-md border border-ink/10 bg-ivory/70 p-3 text-sm outline-none focus:border-gold"
      />
    </label>
  );
}
