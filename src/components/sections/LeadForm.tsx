"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Field {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  wide?: boolean;
}
const wholesaleFields: Field[] = [
  {
    name: "name",
    label: "Your name",
    placeholder: "Full name",
    required: true,
  },
  {
    name: "businessName",
    label: "Business name",
    placeholder: "Hotel, restaurant, studio...",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "+91",
    type: "tel",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "you@business.com",
    type: "email",
    required: true,
  },
  {
    name: "requiredFlowers",
    label: "Flowers required",
    placeholder: "Roses, mogra, mixed stems...",
    required: true,
  },
  {
    name: "quantity",
    label: "Quantity",
    placeholder: "Approx. stems or bunches",
    required: true,
  },
  {
    name: "deliveryDate",
    label: "Delivery date",
    placeholder: "",
    type: "date",
    required: true,
  },
  {
    name: "location",
    label: "Delivery location",
    placeholder: "Area / venue",
    required: true,
  },
  {
    name: "requirements",
    label: "Requirements",
    placeholder: "Tell us about colours, timing, packaging, or recurring needs",
    wide: true,
  },
];
const weddingFields: Field[] = [
  {
    name: "name",
    label: "Your name",
    placeholder: "Full name",
    required: true,
  },
  {
    name: "phone",
    label: "Phone",
    placeholder: "+91",
    type: "tel",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    placeholder: "you@example.com",
    type: "email",
    required: true,
  },
  {
    name: "occasion",
    label: "Event type",
    placeholder: "Wedding, engagement, reception...",
    required: true,
  },
  {
    name: "deliveryDate",
    label: "Event date",
    placeholder: "",
    type: "date",
    required: true,
  },
  {
    name: "location",
    label: "Venue / city",
    placeholder: "Venue name and area",
    required: true,
  },
  {
    name: "quantity",
    label: "Guest count / scale",
    placeholder: "Approx. guests or installations",
  },
  { name: "budget", label: "Budget range", placeholder: "₹" },
  {
    name: "requirements",
    label: "Your vision",
    placeholder: "Stage, bridal flowers, table styling, palette...",
    wide: true,
  },
];

export function LeadForm({
  kind = "wholesale",
}: {
  kind?: "wholesale" | "wedding";
}) {
  const [submitted, setSubmitted] = useState(false);
  const fields = kind === "wedding" ? weddingFields : wholesaleFields;
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    console.log(`TODO Phase 9: POST ${kind} enquiry to the real API`, payload);
    setSubmitted(true);
    event.currentTarget.reset();
  };
  if (submitted)
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl bg-sage p-8 text-center">
        <Check size={34} className="text-sage-ink" />
        <h3 className="mt-5 font-display text-3xl">Enquiry received.</h3>
        <p className="mt-3 max-w-sm text-sm leading-7 text-ink-soft">
          Thank you. A member of our floral team will come back to you with next
          steps.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold underline underline-offset-4"
        >
          Send another enquiry
        </button>
      </div>
    );
  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-xl bg-white/70 p-6 md:grid-cols-2 md:p-8"
    >
      {fields.map((field) => (
        <label
          key={field.name}
          className={`text-sm font-semibold ${field.wide ? "md:col-span-2" : ""}`}
        >
          {field.label}
          <input
            required={field.required}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            className="mt-2 w-full rounded-md border border-ink/10 bg-ivory/70 px-4 py-3 text-sm font-normal outline-none focus:border-gold"
          />
        </label>
      ))}
      <Button type="submit" size="lg" className="md:col-span-2">
        Request a quote
      </Button>
    </form>
  );
}
