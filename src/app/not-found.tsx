import Link from "next/link";
import { ArrowRight, Flower2 } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-ivory px-5 py-20">
      <div className="mx-auto max-w-xl text-center">
        <div
          aria-hidden="true"
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blush"
        >
          <Flower2 size={44} strokeWidth={1} className="text-ink/40" />
        </div>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
          404 — Petal not found
        </p>
        <h1 className="mt-3 text-5xl">
          This bouquet seems to have wilted away.
        </h1>
        <p className="mt-5 text-sm leading-7 text-ink-soft">
          The page you are looking for has moved, bloomed somewhere else, or
          never existed. The flowers are still fresh though — let&apos;s get you
          back to them.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/flowers"
            className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-ink-soft"
          >
            Browse flowers <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link
            href="/"
            className="rounded-md border border-ink/15 px-6 py-3 text-sm font-semibold text-ink transition hover:border-gold"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}