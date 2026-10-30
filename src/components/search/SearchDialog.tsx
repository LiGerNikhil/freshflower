"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  FileText,
  Flame,
  FolderOpen,
  LoaderCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { ProductItemImage } from "@/components/sections/ProductItemImage";
import type { SearchHit, SearchResponse } from "@/lib/search/types";
import { cn } from "@/lib/utils";

const RECENT_KEY = "ff-recent-searches-v1";
const POPULAR_SEARCHES = [
  "Roses",
  "Mogra mala",
  "Marigold",
  "Lily",
  "Bouquet",
];

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
  } catch {
    return [];
  }
}

function saveRecent(term: string, current: string[]): string[] {
  const trimmed = term.trim();
  if (trimmed.length < 2) return current;
  const next = [
    trimmed,
    ...current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
  ].slice(0, 6);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Storage can be unavailable in private mode; recent searches are optional.
  }
  return next;
}

interface SearchSection {
  title: string;
  hits: SearchHit[];
  offset: number;
}

function SectionIcon({ entity }: { entity: SearchHit["entity"] }) {
  const className = "text-ink-soft";
  if (entity === "category") return <FolderOpen size={20} className={className} />;
  if (entity === "collection") return <Sparkles size={20} className={className} />;
  return <FileText size={20} className={className} />;
}

function ResultRow({
  hit,
  index,
  active,
  onHover,
  onSelect,
}: {
  hit: SearchHit;
  index: number;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  const isProduct = hit.entity === "flower" || hit.entity === "bouquet";
  const soldOut = hit.stockStatus === "sold-out";

  return (
    <Link
      id={`search-option-${index}`}
      href={hit.href}
      role="option"
      aria-selected={active}
      onClick={(event) => {
        event.preventDefault();
        onSelect();
      }}
      onMouseEnter={onHover}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
        active ? "bg-white shadow-sm" : "hover:bg-white/70",
      )}
    >
      {isProduct ? (
        <ProductItemImage
          image={hit.image}
          name={hit.title}
          className="h-11 w-11 rounded-lg"
        />
      ) : (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-ivory-deep">
          <SectionIcon entity={hit.entity} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">
          {hit.title}
        </span>
        <span className="mt-0.5 block truncate text-xs text-ink-soft">
          {hit.subtitle || hit.categoryName || hit.entity}
        </span>
      </span>

      {isProduct && (
        <span className="shrink-0 text-right">
          {typeof hit.price === "number" && (
            <span className="block text-sm font-bold text-ink">
              ₹{hit.price.toLocaleString("en-IN")}
            </span>
          )}
          <span
            className={cn(
              "mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em]",
              soldOut ? "text-ink-soft/70" : "text-sage-ink",
            )}
          >
            {soldOut ? "Sold out" : hit.availableToday ? "Today" : "Pre-order"}
          </span>
        </span>
      )}
    </Link>
  );
}

function Chip({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white/65 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-gold/50 hover:bg-white"
    >
      {icon}
      {label}
    </button>
  );
}

export function SearchTrigger() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const cache = useRef(new Map<string, SearchResponse>());
  const requestId = useRef(0);

  const applyQuery = useCallback((next: string) => {
    setQuery(next);
    setActiveIndex(-1);
    setError(false);

    const trimmed = next.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    const cached = cache.current.get(trimmed.toLowerCase());
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    setResults(null);
    setLoading(true);
  }, []);

  const openSearch = useCallback(() => {
    setOpen(true);
    setRecent(readRecent());
    const params = new URLSearchParams(window.location.search);
    applyQuery(params.get("q") ?? "");
  }, [applyQuery]);

  const closeSearch = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
    setResults(null);
    setError(false);
    setLoading(false);
  }, []);

  const rememberAndGo = useCallback(
    (href: string, term: string) => {
      const nextRecent = saveRecent(term, readRecent());
      setRecent(nextRecent);
      setOpen(false);
      setQuery("");
      setResults(null);
      setActiveIndex(-1);
      router.push(href);
    },
    [router],
  );

  const searchAll = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (trimmed.length < 2) return;
      const bouquetsOnly =
        results !== null &&
        results.counts.flowers === 0 &&
        results.counts.bouquets > 0;
      rememberAndGo(
        `${bouquetsOnly ? "/bouquets" : "/flowers"}?q=${encodeURIComponent(trimmed)}`,
        trimmed,
      );
    },
    [rememberAndGo, results],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closeSearch();
        else openSearch();
        return;
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeSearch();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSearch, open, openSearch]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    if (cache.current.has(trimmed.toLowerCase())) return;

    const id = ++requestId.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&limit=8`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          },
        );
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as SearchResponse;
        if (id !== requestId.current) return;
        cache.current.set(trimmed.toLowerCase(), data);
        setResults(data);
        setLoading(false);
        setActiveIndex(-1);
      } catch {
        if (controller.signal.aborted || id !== requestId.current) return;
        setError(true);
        setLoading(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  const rows = useMemo(() => {
    if (!results) return [];
    return [
      ...results.flowers,
      ...results.bouquets,
      ...results.categories,
      ...results.collections,
      ...results.pages,
    ];
  }, [results]);

  const sections = useMemo<SearchSection[]>(() => {
    if (!results) return [];
    const groups: Omit<SearchSection, "offset">[] = [
      { title: "Flowers", hits: results.flowers },
      { title: "Bouquets", hits: results.bouquets },
      { title: "Categories", hits: results.categories },
      { title: "Collections", hits: results.collections },
      { title: "Pages & guides", hits: results.pages },
    ];
    let offset = 0;
    return groups.map((group) => {
      const section = { ...group, offset };
      offset += group.hits.length;
      return section;
    });
  }, [results]);

  const safeActiveIndex = activeIndex < rows.length ? activeIndex : -1;

  const onInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!rows.length) return;
      setActiveIndex((current) =>
        current < rows.length - 1 ? current + 1 : 0,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!rows.length) return;
      setActiveIndex((current) =>
        current > 0 ? current - 1 : rows.length - 1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const active = safeActiveIndex >= 0 ? rows[safeActiveIndex] : undefined;
      if (active) rememberAndGo(active.href, query);
      else searchAll(query);
    }
  };

  const showStart = query.trim().length < 2;
  const showNoResults =
    !showStart && !loading && !error && results !== null && results.total === 0;
  const productCount =
    (results?.counts.flowers ?? 0) + (results?.counts.bouquets ?? 0);
  const viewAllTarget =
    results && results.counts.flowers === 0 && results.counts.bouquets > 0
      ? {
          href: `/bouquets?q=${encodeURIComponent(query.trim())}`,
          label: `View all ${results.counts.bouquets} ${
            results.counts.bouquets === 1 ? "bouquet" : "bouquets"
          }`,
        }
      : {
          href: `/flowers?q=${encodeURIComponent(query.trim())}`,
          label: `View all ${productCount} ${
            productCount === 1 ? "flower" : "flowers"
          }`,
        };

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        aria-label="Search flowers and bouquets"
        className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/60 px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-gold/50 hover:bg-white hover:text-ink"
      >
        <Search size={17} className="text-gold" />
        <span className="hidden lg:inline">Search</span>
        <kbd className="ml-1 hidden rounded border border-ink/10 bg-ivory px-1.5 py-0.5 text-[10px] font-medium text-ink-soft xl:inline">
          ⌘K
        </kbd>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="search-overlay"
                className="fixed inset-0 z-[70]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
            <motion.button
              type="button"
              aria-label="Close search"
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
            />

            <div className="absolute inset-0 flex flex-col sm:items-start sm:justify-center sm:px-6 sm:pb-6 sm:pt-24">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Search products"
                className="flex h-[100dvh] w-full flex-col bg-ivory text-ink sm:h-auto sm:max-h-[min(72vh,42rem)] sm:w-[min(42rem,100%)] sm:rounded-2xl sm:border sm:border-ink/10 sm:shadow-2xl"
                initial={{ opacity: 0, y: 12, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.99 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
              <div className="flex items-center gap-2 border-b border-ink/10 px-4 py-3 sm:gap-3 sm:px-5">
                <Search size={19} className="shrink-0 text-gold" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => applyQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search flowers, bouquets, categories…"
                  aria-label="Search flowers, bouquets and categories"
                  role="combobox"
                  aria-expanded={!showStart}
                  aria-controls="search-suggestions"
                  aria-autocomplete="list"
                  aria-activedescendant={
                    safeActiveIndex >= 0
                      ? `search-option-${safeActiveIndex}`
                      : undefined
                  }
                  className="min-w-0 flex-1 bg-transparent py-1 text-base text-ink outline-none placeholder:text-ink-soft/60 sm:text-sm"
                />
                {loading && (
                  <LoaderCircle
                    size={17}
                    className="shrink-0 animate-spin text-ink-soft"
                    aria-label="Searching"
                  />
                )}
                {query && (
                  <button
                    type="button"
                    onClick={() => applyQuery("")}
                    aria-label="Clear search"
                    className="shrink-0 rounded-full p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                  >
                    <X size={17} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="shrink-0 rounded-full p-1.5 text-ink-soft transition hover:bg-ink/5 hover:text-ink"
                >
                  <X size={18} className="hidden sm:block" />
                  <span className="text-xs font-bold sm:hidden">Close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4">
                {showStart && (
                  <div className="space-y-5">
                    {recent.length > 0 && (
                      <section>
                        <div className="mb-2 flex items-center justify-between px-1">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                            Recent searches
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                window.localStorage.removeItem(RECENT_KEY);
                              } catch {
                                // Ignore unavailable storage.
                              }
                              setRecent([]);
                            }}
                            className="text-[11px] font-semibold text-ink-soft underline underline-offset-2 hover:text-ink"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recent.map((term) => (
                            <Chip
                              key={term}
                              label={term}
                              icon={<Clock3 size={12} />}
                              onClick={() => applyQuery(term)}
                            />
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                      <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                        Popular right now
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {POPULAR_SEARCHES.map((term) => (
                          <Chip
                            key={term}
                            label={term}
                            icon={<Flame size={12} />}
                            onClick={() => applyQuery(term)}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="rounded-xl bg-white/60 p-4">
                      <p className="text-sm font-semibold text-ink">
                        Search the whole shop
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-soft">
                        Find flowers, bouquets, categories, seasonal collections
                        and delivery guides. Try “gulab”, “gajra” or “60 rose”.
                      </p>
                    </section>
                  </div>
                )}

                {!showStart && loading && !results && (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                    <LoaderCircle
                      size={26}
                      className="animate-spin text-gold"
                    />
                    <p className="text-sm text-ink-soft">Searching the shop…</p>
                  </div>
                )}

                {!showStart && error && (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 text-center">
                    <p className="font-display text-2xl">Search is unavailable.</p>
                    <p className="text-sm leading-6 text-ink-soft">
                      Please try again, or browse the full catalogue.
                    </p>
                    <button
                      type="button"
                      onClick={() => searchAll(query)}
                      className="text-sm font-semibold text-ink underline underline-offset-4"
                    >
                      Browse all flowers
                    </button>
                  </div>
                )}

                {showNoResults && results && (
                  <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ivory-deep text-gold">
                      <Search size={24} />
                    </span>
                    <p className="font-display text-2xl">
                      No matches for “{query.trim()}”
                    </p>
                    {results.didYouMean && (
                      <button
                        type="button"
                        onClick={() => applyQuery(results.didYouMean ?? "")}
                        className="mt-2 text-sm font-semibold text-gold underline underline-offset-4"
                      >
                        Did you mean “{results.didYouMean}”?
                      </button>
                    )}
                    <p className="mt-3 max-w-sm text-sm leading-6 text-ink-soft">
                      Try a flower name, category or occasion — or browse a
                      popular search below.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                        <Chip
                          key={term}
                          label={term}
                          onClick={() => applyQuery(term)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {!showStart && !error && results && results.total > 0 && (
                  <div
                    id="search-suggestions"
                    role="listbox"
                    aria-label="Search suggestions"
                  >
                    {sections.map((section) => {
                      if (!section.hits.length) return null;
                      return (
                        <section
                          key={section.title}
                          role="group"
                          aria-label={section.title}
                          className="mb-3 last:mb-0"
                        >
                          <p className="mb-1.5 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
                            {section.title}
                          </p>
                          <div className="space-y-0.5">
                            {section.hits.map((hit, index) => {
                              const rowIndex = section.offset + index;
                              return (
                                <ResultRow
                                  key={`${hit.entity}-${hit.id}`}
                                  hit={hit}
                                  index={rowIndex}
                                  active={safeActiveIndex === rowIndex}
                                  onHover={() => setActiveIndex(rowIndex)}
                                  onSelect={() =>
                                    rememberAndGo(hit.href, query)
                                  }
                                />
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}

                    {productCount > 0 && (
                      <button
                        type="button"
                        onClick={() => rememberAndGo(viewAllTarget.href, query)}
                        className="mt-1 flex w-full items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3 text-left text-sm font-semibold text-ivory transition hover:bg-ink-soft"
                      >
                        <span className="truncate">
                          {viewAllTarget.label} for “{query.trim()}”
                        </span>
                        <ArrowRight size={16} className="shrink-0" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="hidden items-center justify-between border-t border-ink/10 px-5 py-2.5 text-[11px] text-ink-soft sm:flex">
                <span className="flex items-center gap-2">
                  <kbd className="rounded border border-ink/10 bg-white px-1.5 py-0.5">
                    ↑
                  </kbd>
                  <kbd className="rounded border border-ink/10 bg-white px-1.5 py-0.5">
                    ↓
                  </kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="rounded border border-ink/10 bg-white px-1.5 py-0.5">
                    Enter
                  </kbd>
                  to open
                  <kbd className="rounded border border-ink/10 bg-white px-1.5 py-0.5">
                    Esc
                  </kbd>
                  to close
                </span>
              </div>
            </motion.div>
            </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
