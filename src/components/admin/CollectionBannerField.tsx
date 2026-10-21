"use client";

import Image from "next/image";
import { Flower2, ImageIcon, Trash2 } from "lucide-react";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { isRemoteImage } from "@/lib/utils";

export function CollectionBannerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <section
      aria-labelledby="collection-banner-heading"
      className="rounded-xl border border-gold/35 bg-white/80 p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3
            id="collection-banner-heading"
            className="flex items-center gap-2 font-display text-lg text-ink"
          >
            <ImageIcon size={17} className="text-gold" aria-hidden="true" />
            Collection card banner
          </h3>
          <p className="mt-1 max-w-md text-xs leading-5 text-ink-soft">
            Shown on the Collections page cards, homepage collection cards and
            the collection page header.
          </p>
        </div>
        <span className="rounded-full bg-ivory-deep px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
          Recommended 1600 × 900
        </span>
      </div>

      <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-lg border border-ink/10 bg-ivory-deep">
        {isRemoteImage(value) ? (
          <Image
            src={value}
            alt="Collection banner preview"
            fill
            sizes="(max-width: 768px) 90vw, 720px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-ink-soft">
            <Flower2 size={34} strokeWidth={0.7} aria-hidden="true" />
            <p className="text-xs font-medium">No banner image uploaded yet</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <CloudinaryUpload
          label={value ? "Replace banner image" : "Upload banner image"}
          value={[]}
          multiple={false}
          onChange={(urls) => onChange(urls.at(-1) ?? "")}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:bg-red-100"
          >
            <Trash2 size={15} aria-hidden="true" />
            Remove banner
          </button>
        )}
      </div>
    </section>
  );
}
