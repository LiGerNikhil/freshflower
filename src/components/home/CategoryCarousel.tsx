import Image from "next/image";
import Link from "next/link";
import { Flower2 } from "lucide-react";
import { HorizontalCarousel } from "@/components/home/HorizontalCarousel";
import { Reveal, Section, SectionIntro } from "@/components/home/primitives";
import { GRADIENT_TOKENS } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryCarouselProps {
  categories: Category[];
  title?: string;
  eyebrow?: string;
  href?: string;
}

export function CategoryCarousel({
  categories,
  title = "Shop by category",
  eyebrow = "Find your bloom",
  href = "/categories",
}: CategoryCarouselProps) {
  if (!categories.length) return null;

  return (
    <Section id="shop">
      <Reveal>
        <SectionIntro
          eyebrow={eyebrow}
          title={title}
          href={href}
          linkLabel="See all categories"
        />
      </Reveal>
      <HorizontalCarousel
        label="Shop categories"
        itemClassName="w-[min(66vw,13rem)] sm:w-[min(38vw,15rem)] lg:w-[calc((100%_-_5rem)_/_6)]"
      >
        {categories.map((category) => (
          <Link
            href={`/categories/${category.slug}`}
            key={category.id}
            className="group block"
          >
            <div
              className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg"
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
                  sizes="(max-width: 315px) 66vw, (max-width: 639px) 13rem, (max-width: 1024px) 15rem, 200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <Flower2
                  size={82}
                  strokeWidth={0.65}
                  aria-hidden="true"
                  className="text-ink/25 transition-transform duration-500 group-hover:scale-110"
                />
              )}
              <span className="absolute bottom-4 left-3 right-3 rounded-full bg-ivory/80 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.12em] text-ink backdrop-blur-sm sm:left-4 sm:right-4">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </HorizontalCarousel>
    </Section>
  );
}

export function CategoryCarouselSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="px-5 py-20 sm:px-6 md:px-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 h-10 w-64 animate-pulse rounded bg-ink/10" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="aspect-square w-[min(66vw,13rem)] shrink-0 animate-pulse rounded-lg bg-ink/10 sm:w-52"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
