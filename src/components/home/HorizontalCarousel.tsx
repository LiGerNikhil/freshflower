"use client";

import { Children, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface HorizontalCarouselProps {
  label: string;
  children: ReactNode;
  itemClassName: string;
  className?: string;
  controlsClassName?: string;
}

export function HorizontalCarousel({
  label,
  children,
  itemClassName,
  className = "",
  controlsClassName = "-top-16",
}: HorizontalCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const trackId = useId();

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.8, 240),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      scroll(event.key === "ArrowRight" ? 1 : -1);
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className="relative"
    >
      <div
        id={trackId}
        ref={trackRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={`flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${className}`.trim()}
      >
        {Children.map(children, (child) => (
          <div className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>
      <div className={`absolute right-0 hidden gap-2 md:flex ${controlsClassName}`.trim()}>
        <button
          type="button"
          aria-label={`Scroll ${label} left`}
          aria-controls={trackId}
          onClick={() => scroll(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-ivory text-ink transition hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${label} right`}
          aria-controls={trackId}
          onClick={() => scroll(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-ivory text-ink transition hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
