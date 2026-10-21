import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryQuickNavProps {
  categories: Category[];
  className?: string;
  variant?: "rail" | "grid";
  showViewAll?: boolean;
}

export function CategoryQuickNav({
  categories,
  className = "",
  variant = "rail",
  showViewAll = true,
}: CategoryQuickNavProps) {
  if (!categories.length) return null;

  if (variant === "grid") {
    return (
      <nav
        aria-label="Shop by category"
        className={`grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3 sm:gap-3 lg:grid-cols-6 ${className}`.trim()}
      >
        {categories.slice(0, 6).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            aria-label={`Browse ${category.name}`}
            className="group min-w-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span
              className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-xl border border-ink/5 bg-ivory-deep shadow-sm"
              style={
                category.imageUrl
                  ? undefined
                  : {
                      background:
                        GRADIENT_TOKENS[category.heroImage] ??
                        GRADIENT_TOKENS["gradient-ivory"],
                    }
              }
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="(max-width: 419px) 50vw, (max-width: 639px) 33vw, (max-width: 1023px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
                />
              ) : (
                <Flower2
                  size={34}
                  strokeWidth={0.8}
                  className="text-ink/30 transition-transform duration-500 motion-safe:group-hover:scale-105"
                  aria-hidden="true"
                />
              )}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/5 to-transparent"
              />
              <span className="absolute inset-x-2 bottom-2 line-clamp-2 text-center text-[13px] font-semibold leading-4 text-ivory sm:text-sm">
                {category.name}
              </span>
            </span>
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Shop by category"
      className={`min-w-0 ${className}`.trim()}
    >
      <div className="flex snap-x gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.slice(0, 12).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            aria-label={`Browse ${category.name}`}
            className="group flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-2 rounded-xl p-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-[5.25rem]"
          >
            <span
              className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-white bg-ivory-deep shadow-sm transition-transform duration-300 motion-safe:group-hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]"
              style={
                category.imageUrl
                  ? undefined
                  : {
                      background:
                        GRADIENT_TOKENS[category.heroImage] ??
                        GRADIENT_TOKENS["gradient-ivory"],
                    }
              }
            >
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-cover"
                />
              ) : (
                <Flower2
                  size={30}
                  strokeWidth={0.9}
                  className="text-ink/35"
                  aria-hidden="true"
                />
              )}
            </span>
            <span className="line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-ink">
              {category.name}
            </span>
          </Link>
        ))}

        {showViewAll && (
          <Link
            href="/categories"
            aria-label="View all categories"
            className="group flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-2 rounded-xl p-1 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-[5.25rem]"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-ink/25 bg-white/70 text-ink transition-colors group-hover:border-gold group-hover:bg-white sm:h-[4.5rem] sm:w-[4.5rem]">
              <ArrowRight size={20} aria-hidden="true" />
            </span>
            <span className="min-h-8 text-xs font-semibold leading-4 text-ink">
              View all
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
