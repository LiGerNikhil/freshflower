import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryQuickNavProps {
  categories: Category[];
  className?: string;
}

export function CategoryQuickNav({
  categories,
  className = "",
}: CategoryQuickNavProps) {
  if (!categories.length) return null;

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
      </div>
    </nav>
  );
}
