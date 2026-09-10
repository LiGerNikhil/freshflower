import { Star } from "lucide-react";
import { GOOGLE_MAPS_URL } from "@/lib/utils";

/** Official multicolor Google "G" mark (inline SVG — no external dependency). */
export function GoogleGLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.93 1.19 15.22 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

const REVIEW_URL = GOOGLE_MAPS_URL;

export function ReviewCta() {
  return (
    <section className="border-t border-ink/5 bg-lavender px-5 py-16 md:px-10 md:py-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-ink/10">
          <GoogleGLogo size={30} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          Google reviews
        </p>
        <h2 className="mt-3 font-display text-3xl leading-tight text-ink md:text-4xl">
          Loved your flowers? Leave us a review.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-7 text-ink-soft">
          Your words help others discover fresh, reliable flower delivery in
          Delhi NCR. If we made your morning a little brighter, share it on
          Google — it means the world to our small studio.
        </p>
        <div className="mt-6 flex items-center gap-1.5 text-gold">
          {[0, 1, 2, 3, 4].map((index) => (
            <Star key={index} size={20} fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <a
          href={REVIEW_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2.5 rounded-lg bg-ink px-7 py-3.5 text-sm font-semibold text-ivory shadow-sm transition hover:bg-ink-soft"
        >
          <GoogleGLogo size={17} />
          Leave a review on Google
          <span aria-hidden="true" className="text-base leading-none">
            ↗
          </span>
        </a>
      </div>
    </section>
  );
}