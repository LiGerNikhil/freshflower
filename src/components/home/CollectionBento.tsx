import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";
import type { FestivalCollection } from "@/lib/types";

interface CollectionBentoProps {
  collections: FestivalCollection[];
}

export function CollectionBento({ collections }: CollectionBentoProps) {
  if (!collections.length) return null;

  const visible = collections.slice(0, 3);
  const [featured, ...rest] = visible;
  const containerClass =
    visible.length === 1
      ? "grid gap-3"
      : "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:h-[32rem] lg:grid-cols-2 lg:grid-rows-2";

  return (
    <div className={containerClass}>
      <CollectionCard collection={featured} featured priority />
      {rest.map((collection) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          className={
            rest.length === 1
              ? "col-span-full lg:col-span-1 lg:row-span-2"
              : "col-span-1"
          }
          priority={false}
        />
      ))}
    </div>
  );
}

function CollectionCard({
  collection,
  featured = false,
  priority = false,
  className = "",
}: {
  collection: FestivalCollection;
  featured?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const image = collection.bannerImage;
  const count = collection.productIds.length;
  const countLabel = `${count} ${count === 1 ? "item" : "items"}`;
  const shape = featured
    ? "col-span-full min-h-[13.5rem] min-w-0 sm:min-h-[15rem] lg:col-span-1 lg:row-span-2 lg:h-full lg:min-h-0"
    : "min-h-[11rem] min-w-0 sm:min-h-[12rem] lg:h-full lg:min-h-0";

  return (
    <Link
      href={`/collections/${collection.slug}`}
      aria-label={`Shop ${collection.title}, ${countLabel}`}
      className={`group relative isolate flex overflow-hidden rounded-xl bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${shape} ${className}`.trim()}
    >
      {isRemoteImage(image) ? (
        <Image
          src={image as string}
          alt={`${collection.title} collection`}
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          sizes={
            featured
              ? "(max-width: 1023px) 100vw, 50vw"
              : "(max-width: 479px) 100vw, (max-width: 1023px) 50vw, 25vw"
          }
          className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
        />
      ) : (
        <span
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background:
              GRADIENT_TOKENS[image ?? ""] ??
              GRADIENT_TOKENS["gradient-ivory"],
          }}
          aria-hidden="true"
        >
          <Flower2
            size={featured ? 120 : 72}
            strokeWidth={0.55}
            className="text-ink/20 transition-transform duration-700 motion-safe:group-hover:scale-[1.04]"
          />
        </span>
      )}

      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent"
      />

      {collection.badgeText && (
        <span className="absolute left-3 top-3 z-20 max-w-[70%] truncate rounded-full bg-ivory px-2.5 py-1 text-xs font-bold text-ink shadow-sm sm:left-4 sm:top-4">
          {collection.badgeText}
        </span>
      )}

      <span className="relative z-10 mt-auto flex w-full flex-col items-start p-3 sm:p-4 lg:p-5">
        <span
          className={`line-clamp-2 font-display leading-[1.08] text-ivory ${
            featured
              ? "text-2xl sm:text-3xl lg:text-[2rem]"
              : "text-lg sm:text-xl"
          }`}
        >
          {collection.title}
        </span>

        {collection.subtitle && (
          <span className="mt-1.5 line-clamp-1 text-[13px] leading-5 text-ivory/85 sm:text-sm">
            {collection.subtitle}
          </span>
        )}

        <span className="mt-3 flex w-full flex-wrap items-center justify-between gap-2">
          <span className="inline-flex min-h-7 items-center rounded-full bg-ink/90 px-2.5 py-1 text-xs font-semibold text-ivory">
            {countLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ivory sm:text-sm">
            Shop now
            <ArrowRight
              size={15}
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1"
            />
          </span>
        </span>
      </span>
    </Link>
  );
}
