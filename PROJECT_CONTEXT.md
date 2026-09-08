# FreshFlower.zone — Project Context

Single source of truth across every phase. Read this before starting new work.
Every phase **appends** to the Phase Log at the bottom — never overwrite prior entries.

---

## Stack (locked — do not deviate)

- **Framework**: Next.js 15, App Router, TypeScript, `src/` directory structure
- **Styling**: Tailwind CSS v4 (CSS-first `@theme` config in `src/app/globals.css`)
- **Animation**: Framer Motion
- **3D**: React Three Fiber + drei
- **Data**: MongoDB + Mongoose — schema defined in `/src/lib/db`, **not called yet**.
  All preview data comes from `/src/lib/data/*.ts`. Swapping dummy data for real
  Mongoose queries should touch only `/src/lib/data/*.ts` — never components or pages.
- **Icons**: lucide-react
- **Images**: `next/image` — gradient tokens as fallback for products without photos; real
  client-supplied remote photos now live in `images[0]` / `Category.imageUrl`, rendered
  via `next/image` and guarded by `isRemoteImage()` (see `GRADIENT_TOKENS` in
  `/src/lib/utils.ts`; allowed hosts in `next.config.ts` → `images.remotePatterns`)
- **Video**: local hero backgrounds (`/public/assets/video/*.mp4`) via `HeroVideo`
  (`src/components/sections/HeroVideo.tsx`) — full-bleed autoplay `<video>` + ivory
  scrim. `bg1.mp4` on the homepage; `bg2.mp4` on shop, bouquets, occasions, wholesale,
  wedding & events, about, blog, contact (via `EditorialHeader` `video` prop).

---

## Sitemap

**Not yet provided.** The brief references "the full list separately" — this section
should be filled in verbatim once that list is supplied, covering both public and
admin routes. Until then, only the Phase 0 sanity-check route exists (`/`, to be
deleted in Phase 1).

---

## Design system summary

**Brand**: premium/luxury florist, Delhi NCR. Not generic e-commerce.

- **Color** (Tailwind theme tokens, see `@theme` in `globals.css`):
  - `--color-ivory` `#FBF7F0` — base background
  - `--color-ivory-deep` `#F4EDE1`
  - `--color-blush` `#F7E9E3` / `--color-blush-deep` `#EECFC4`
  - `--color-sage` `#EEF1E4` / `--color-sage-ink` `#7C8A6B`
  - `--color-lavender` `#E9E3F0` / `--color-lavender-ink` `#9285A8`
  - `--color-gold` `#C9A24B` / `--color-gold-soft` `#E3CD93` — premium accent, **used sparingly**
  - `--color-ink` `#2B2620` (warm charcoal, not pure black) / `--color-ink-soft` `#5A5248`
- **Type**: Fraunces (display serif, headings, `--font-display`) + Manrope (body/UI sans,
  `--font-body`), both loaded via `next/font/google` in `src/app/layout.tsx`.
- **Glass**: `.glass` and `.glass-deep` utility classes in `globals.css`
  (frosted background via `backdrop-filter: blur()`, subtle border, soft shadow).
  Used for nav, product quick-view, floating cards, modals.
- **Radius scale**: `--radius-sm` 0.625rem → `--radius-xl` 2.25rem, consistently
  rounded across cards/buttons/inputs.
- **Motion**: soft fades/slides on scroll via Framer Motion `whileInView`, bloom/scale
  hover on flower cards, no jarring transitions. `prefers-reduced-motion` respected
  globally in `globals.css`.

---

## Data model summary

Full interfaces in `/src/lib/types/index.ts`. Entity list:

- **Catalog**: `Category`, `Occasion`, `Flower`, `Bouquet` (+ `BouquetItem`)
- **Cart/Orders**: `CartItem`, `Order` (+ `OrderItem`), `OrderStatus` enum
  (`received → confirmed → preparing → ready → out_for_delivery → delivered`, or `cancelled`)
- **Delivery**: `DeliverySlot`, `DeliveryArea`
- **Customers**: `Customer`, `Address`
- **Content**: `Review`, `BlogPost`, `Coupon`
- **Enquiries**: `WholesaleEnquiry`, `WeddingEnquiry`, `ContactEnquiry`
- **Admin**: `AdminUser`, `AdminRole` enum (`super_admin`, `order_manager`,
  `inventory_manager`, `content_manager`, `support_manager`)

Dummy data lives in `/src/lib/data/*.ts`, one file per entity, re-exported from
`/src/lib/data/index.ts`. Mongoose schemas mirroring the same shape live in
`/src/lib/db/schemas.ts` (Phase 2, inactive — no page or component imports from
`/src/lib/db` yet).

---

## Known limitations (preview build)

- **Dummy data only** — nothing persists; all reads come from static TS files in `/src/lib/data`.
- **No real payments** — checkout flow (when built) will stub payment with clear `// TODO: Phase X — integrate real payment gateway` comments.
- **No real auth** — customer/admin login (when built) will stub session with clear TODO comments.
- **No real WhatsApp/SMS/email sending** — order confirmations, delivery updates, etc. will be stubbed with TODO comments describing the intended integration point.
- **"Preview Mode" indicator** — not built yet. Concept: a small persistent visual
  indicator (e.g. a corner badge or banner) making clear to anyone browsing that this
  is a client preview build with no real transactions. To be designed and built in a
  later phase.

---

## Phase Log

**Phase 0 complete:** Scaffolded the Next.js 15 App Router project (TypeScript,
`src/` structure, Tailwind v4, Framer Motion, R3F + drei, lucide-react, mongoose
installed but inactive). Built the full folder structure (`app`, `components/{ui,sections,three}`,
`lib/{data,types,db}`, `styles`). Defined every TypeScript interface from the brief in
`/src/lib/types/index.ts`. Populated realistic dummy data: 12 flowers across 9 categories
(Roses, Gerbera, Mogra, Sunflower, Carnations, Orchid, Lily, Rajnigandha, Baby's Breath),
3 bouquets, 8 occasions, 6 Delhi NCR delivery areas, 7 morning delivery slots (5 AM–12 PM),
6 orders spanning every `OrderStatus`, 4 customers, 5 reviews, 3 blog posts, 3 coupons.
Wrote (inactive) Mongoose connection helper and schemas in `/src/lib/db` mirroring the
type layer, ready for Phase 2. Established the luxury-florist design system: ivory/blush/
sage/lavender palette with a sparing champagne-gold accent, Fraunces + Manrope typefaces,
`.glass`/`.glass-deep` utilities, consistent rounded radius scale. Built five reusable UI
primitives (`Button`, `Card`/`GlassCard`, `Badge`, `Input`, `Modal`) in `/src/components/ui`.
Added a Phase-0-only sanity-check home route confirming all design tokens render correctly
(to be deleted in Phase 1). Created this file.

**Phase 1 complete:** Replaced the Phase 0 sanity-check route with the full data-driven
FreshFlower.zone homepage in the requested order: hero, category shop, best sellers,
today's fresh flowers, morning delivery, occasions, value props, delivery areas,
wholesale CTA, reviews, gallery, FAQ, and newsletter/WhatsApp strip. Added the reusable
animated homepage surface in `/src/components/sections/HomepageClient.tsx`, including
responsive navigation, ProductCard quick view, wishlist state, add-to-cart feedback,
availability badges, FAQ accordion, and subtle Framer Motion entrance/reveal effects.
Added `Flower.availableToday` to the shared type and dummy data contract, plus the shared
FAQ dataset in `/src/lib/data/faqs.ts`. The route imports only from `/src/lib/data`.
Production build compiled, linted, type-checked, collected page data, and generated static
pages successfully. Awaiting confirmation before Phase 3.

**Dependency upgrade complete:** Upgraded the project to Next 16.3.4, React 19.2.8,
Framer Motion 13.2.0, React Three Fiber 9.7.0, drei 10.7.8, Three 0.185.1,
Mongoose 9.9.5, lucide-react 1.42.0, Tailwind CSS 4.3.3, TypeScript 6.0.3,
ESLint 9.39.5, and current supporting type packages. Migrated the lint script from
the removed `next lint` command to `eslint .` and added the flat Next core-web-vitals
config in `/eslint.config.mjs`. Updated the homepage icon import and Framer Motion
variant typing for the new package APIs. `npm run lint`, `npm audit`, and `npm run build`
all pass; the full audit reports 0 vulnerabilities.

**Phase 3 complete:** Built the dynamic `/flowers` catalogue route with shareable URL
state for live name search, multi-select categories, sorting, availability, occasions,
price range, quantity/unit filters, and pagination. Added responsive desktop filters and
a mobile glass bottom-sheet filter panel, empty-state clear action, responsive product
grid, Buy Now checkout routing, quick-view quantity selector, wishlist, and cart feedback.
Extracted the reusable ProductCard into `/src/components/sections/ProductCard.tsx` and
updated the homepage to consume it. The catalogue uses only `/src/lib/data` and preview
gradient tokens. `npm run build` and touched-file diagnostics pass; lint has no errors and
retains one unrelated existing warning in `/src/lib/db/connect.ts`. Awaiting confirmation
before Phase 4.

**Phase 3 runtime fix:** Moved the pure catalogue query-state contract, `MAX_PRICE`,
and `parseList` helper into `/src/lib/catalog.ts`. The `/flowers` server page no longer
imports callable helpers from the client component, resolving the Next.js runtime error
about invoking `parseList()` from the server. Build and touched-file diagnostics pass;
lint remains error-free with the existing unrelated database warning.

Post-log validation: corrected shared ProductCard status mapping so in-stock flowers
without `availableToday` display `Pre-order` rather than `Available Today`; production
build still passes for `/`, `/flowers`, and `/_not-found`.

**Phase 4 complete:** Built `/flowers/[slug]` with `generateStaticParams` for all dummy
flowers and product-specific `generateMetadata` title/description. Added image gallery
with hover zoom and lightbox, availability and product details, quantity controls, date
picker, shared `/src/components/ui/DeliverySlotSelector.tsx`, Add to Cart, Buy Now,
prefilled WhatsApp order link, delivery summary, related and similar ProductCard grids,
filtered reviews, product FAQ accordion, and an explicit TODO location for future Product
JSON-LD. Production build generated all 12 static product paths successfully; diagnostics
are clean and lint has no errors beyond the existing unrelated database warning. Awaiting
confirmation before Phase 5.

**Phase 5 complete:** Built `/categories` and `/occasions` directory grids with counts,
distinct editorial intro copy, and links into their dynamic collections. Added dynamic
`/categories/[slug]` and `/occasions/[slug]` pages with generated metadata, unique
category/occasion hero copy, server-side preselection, and the existing shareable
FlowersCatalogue filter/sort/ProductCard pattern. Expanded dummy occasions to cover
Valentine's Day, Mother's Day, Romantic, and Corporate in addition to the existing set.
Built `/bouquets` with premium bouquet cards, a custom bouquet enquiry form for name,
phone, occasion, budget, and description, success feedback, console payload logging, and
a clear TODO for the future API call. Added `/bouquets/[slug]` with generated static
params/metadata, bouquet details, quantity/date/slot selection using the shared
DeliverySlotSelector, cart actions, related bouquet links, and the flowers within each
arrangement. All requested pages have differentiated real copy. Production build
generated 43 routes successfully and touched-file diagnostics are clean; lint has no
new errors beyond the existing unrelated database warning. Awaiting confirmation before
Phase 6.

**Phase 6 complete:** Added a shared root `CartProvider` with localStorage persistence,
quantity updates, removal, clear-safe hydration, item counts, and subtotal calculation.
Updated the shared ProductCard to write flower line items into the persistent cart.
Built `/cart` with line-item imagery, names, prices, quantity steppers, remove actions,
per-item subtotals, empty state, continue-shopping and booking actions, sticky glass order
summary, coupon validation against dummy coupon data, applied/invalid feedback, discount,
total, and the configurable `DELIVERY_NOTE` business rule in `/src/lib/cart.ts`.
Production build generated 44 routes successfully and touched-file diagnostics are clean;
lint has no new errors beyond the existing unrelated database warning. Awaiting
confirmation before Phase 7.

**Phase 7 complete:** Built `/checkout` as a validated three-step mobile-first flow:
Details, Delivery, and Review. Added customer fields with WhatsApp same-as-mobile
handling, delivery address/area/city/pincode/landmark/instructions, immediate six-digit
pincode serviceability feedback against dummy delivery areas, past-date prevention, and
**Phase 8 complete:** Built the dummy-auth account section for the demo customer at
`/account`, with profile summary and quick links, plus `/account/orders`, saved address
CRUD at `/account/addresses`, persistent WishlistContext-backed `/account/wishlist`,
notifications, and customer reviews views. Added generated order detail routes under
`/account/orders/[orderId]` and the reusable OrderStatusStepper for received through
delivered progress. Added a root WishlistProvider with localStorage persistence and
connected shared ProductCard wishlist toggles to it; wishlist items support move to cart
and remove actions. Address changes remain in-memory by design, and the account structure
keeps the demo customer boundary ready for NextAuth or another real session provider.
Production build generated 53 routes successfully; account diagnostics are clean and
lint has no new errors beyond the existing unrelated database warning. Awaiting
confirmation before Phase 10.

Post-log validation: scoped the intentional WishlistProvider localStorage hydration
update for the React hooks lint rule. The account build remains successful and lint has
no new errors; only the existing unrelated database warning remains.
availability through the single swappable `getSlotAvailability` function and extended
the shared DeliverySlotSelector to show Available/Full states. Added cost breakdown with
the configurable Porter delivery note, order review, dummy order ID generation, temporary
sessionStorage order handoff with a clear future POST-to-orders TODO, and dynamic
`/order-confirmation/[orderId]` display. Production build generated 45 routes; touched
files are diagnostic-clean and lint has no new errors beyond the existing unrelated
database warning. Awaiting confirmation before Phase 8.

**Phase 9 complete:** Built out the full set of content and lead-generation pages.

- **`/wholesale`**: bulk order pitch for hotels & resorts, restaurants & cafés,
  florists & studios, event decorators, corporate gifting, and temples/institutions;
  three-step "how it works" section, benefits, regular-supply / event / emergency
  cards, direct-contact block, and the shared `LeadForm` with wholesale fields
  (name, business name, phone, email, required flowers, quantity, delivery date,
  location, requirements). Submitting logs the payload to the console with a
  `TODO Phase 9: POST wholesale enquiry to the real API` marker and shows a success
  state.
- **`/wedding-events`**: showcase for mandap/venue, stage/backdrop, bridal flowers,
  and table/dining with distinct icons and copy; colour-led design / venue-aware
  planning / day-of coordination approach section; an "events beyond weddings" list;
  and the shared `LeadForm` with the wedding variant (name, phone, email, event type,
  event date, venue, scale, budget, vision) which logs and confirms on submit.
- **`/about`**: full real brand story — origin, sourcing/freshness approach, Delhi NCR
  service, values (freshness, premium-without-fuss, reliable mornings, human help),
  what we do differently (small-batch sourcing, morning-first delivery, transparent
  pricing, made-for-Delhi-NCR), and a closing CTA. No placeholder copy.
- **`/contact`**: name/phone/email/subject/message form plus call & WhatsApp actions
  (`tel:` / `wa.me` deep links), email card, business-hours display, a service-area
  grid driven by the `deliveryAreas` dummy data, and quick links to wholesale/wedding/
  delivery/FAQ/account.
- **`/faq`**: expanded `faqs` dataset from 10 to 27 Q&As grouped into six categories
  (Delivery, Porter, Freshness & Quality, Pricing & Payment, Booking & Orders,
  Wholesale, Wedding & Events) covering delivery windows, Morning Express, same-day
  rules, cutoff times, delivery charges, Porter policy, care, pre-order, payment,
  coupons, booking, custom orders, cancellation, tracking, wholesale minimums/pricing/
  recurring/corporate, and wedding planning/timeline/budget. The `/faq` route renders
  the dataset grouped by category using the existing `FAQAccordion`.
- **`/reviews`**: expanded approved dummy reviews from 5 to 12, added an optional
  `photoUrl` field to the `Review` type, and rebuilt `ReviewsClient` with average
  rating + review count + 5-star stats, star icons, rating (5/4/3) and product
  filters, clear-filters control, verified-purchase badges, photo panels using the
  existing gradient tokens, and an empty state.
- **Legal pages** (`/privacy-policy`, `/terms`, `/refund-policy`, `/delivery-policy`):
  replaced the short placeholders with comprehensive, sensible boilerplate
  appropriate for an Indian flower e-commerce business — data collection/use/sharing/
  security, order acceptance, product variation, customer responsibility, force
  majeure, governing law (India), cancellation/refund timelines, Porter-charge
  payment, festival/peak-season notes, etc. All carry the clear
  "Preview/draft legal content — must be reviewed by the client/a professional
  before launch" banner via `LegalPage`.
- **`/delivery`**: detailed delivery info — morning delivery explanation (why 5 AM–12
  PM, Morning Express), service areas with pincodes and fees, full Porter policy
  (charges/estimation/payment/recurring), same-day rules, order cutoff times for
  same-day/next-day/large/recurring, and contact info (phone/WhatsApp/email/hours).

Internal navigation switched to `next/link` where the new pages link between routed
pages. Added `photoUrl?: string` to the `Review` interface (kept in sync with the
dummy data only; no `/lib/db` import). Production build generated 64 routes
successfully; lint has no new errors beyond the existing unrelated database warning.
Awaiting confirmation before Phase 11.

**Post-log (Phase 9 continuation) — site-wide nav & footer integration:** Extracted
the homepage-only embedded navigation and footer into two shared components,
`/src/components/sections/SiteNav.tsx` and `/src/components/sections/SiteFooter.tsx`,
and mounted them once in the root layout inside a `flex min-h-screen flex-col`
wrapper (nav top, content flex-1, footer pinned to bottom). Every page now shares:

- **SiteNav**: sticky glass pill bar with logo, desktop links (Shop → `/flowers`,
  Bouquets, Occasions, Wholesale, Wedding & Events, About, Contact), a `tel:`
  call button, cart icon → `/cart`, and a mobile hamburger menu (burger → links
  including FAQ, Reviews, and a filled Delivery info link), closing on click.
- **SiteFooter**: dark footer with brand blurb + call/WhatsApp/email icon actions;
  a Shop column (flowers, bouquets, categories, occasions, cart); a Company column
  (about, wholesale, wedding & events, reviews, delivery info, FAQ, contact); a
  Contact column with phone/email/location/hours; a Policies column (privacy,
  terms, refunds, delivery policy); and a bottom copyright bar.

Removed the now-redundant embedded `<header>` navbars that previously sat inside
`HomepageClient`, `FlowersCatalogue`, `FlowerDetailClient`, `CartPageClient`,
`CheckoutClient`, `BouquetCard`, `BouquetDetailClient`, `DirectoryGrid`,
`AccountShell`, and `ReviewsClient` (each was a hand-built logo + minimal nav
duplicating the shared bar). Adjusted the homepage hero top padding for the sticky
shared nav, and moved the catalogue sticky filter bar from `top-0` to `top-[68px]`
so it clears the nav. Cleaned up now-unused imports (`ArrowLeft`/`ArrowRight`/
`Badge`/`Link`/`ShoppingBag`) and a legacy preview-only `cartCount` state in the
catalogue. Lint is clean (only the existing unrelated DB warning) and the production
build still generates all 64 routes. Verified live via headless browser: shared
nav + footer appear on `/`, `/wholesale`, `/about`, `/faq`, `/reviews`, `/contact`,
`/delivery`; mobile menu toggles and deep-links correctly; wholesale enquiry form
still submits and shows its success state. Awaiting confirmation before Phase 11.

**Phase 11 complete — blog, local SEO landing pages & technical SEO.** Three work
streams landed together:

- **Blog** (`/blog`, `/blog/[slug]`): extended the `BlogPost` type with a `category`
  and a structured `sections` body (`heading`/`paragraphs`/`bullets`), syncing the
  same shape into `/src/lib/db/schemas.ts` (`BlogSectionSchema`, `_id: false`) for the
  future Mongoose swap. Rebuilt `/src/lib/data/blogs.ts` with 8 rich posts (rose care,
  birthday, wedding decoration, morning delivery, rose varieties, flower-gifting
  meanings, repurposing, puja days-level local content), plus helpers in
  `/src/lib/blog.ts` (`readingMinutes`, `formatPostDate`, `postsByCategory`,
  `allTags`, `relatedPosts`). New components: `ArtCover` (editorial gradient cover,
  `role="img"` + `aria-label`), `BlogIndexClient` (category tabs, tag chips, live
  search, empty state, reading via `?tag=`/`?category=` search params), and
  `ShareButtons` (WhatsApp / X / email / copy-link). `/blog/[slug]` renders the
  structured sections, tags, related-posts, and share buttons, with a BlogPosting +
  BreadcrumbList JSON-LD block.
- **Local SEO landing pages**: `/src/lib/data/seoPages.ts` holds 6 city pages
  (Delhi, Gurgaon, Noida, Greater Noida, Ghaziabad, Faridabad) with genuinely
  distinct copy — local areas, pincodes, delivery fees, ETAs, FAQs, and curated
  `flowerIds` — and 3 occasion pages (Birthday, Anniversary, Wedding). The shared
  `SeoLandingPage` component (explicit `TONES` map to avoid Tailwind dynamic-class
  issues) renders hero, highlights, a dark local-delivery block, the existing
  `FilteredFlowerCollection` grid (via new `baseCatalogState` + `pickFlowersOrdered`
  helpers in `/src/lib/catalog.ts`), an FAQ accordion, nearby links, and a CTA.
  All 9 routes carry typed metadata, canonical, Open Graph, BreadcrumbList, and
  FAQPage JSON-LD. `deliveryAreas` grew from 6 to 9 areas (Greater Noida, Ghaziabad,
  Faridabad) and hardcoded "six areas" copy in the `/delivery` page and two FAQ
  answers was fixed.
- **Technical SEO**: rewrote the root layout with `metadataBase`,
  `title template "%s | FreshFlower.zone"`, default OG/Twitter, `theme-color`, and a
  shared `ORGANIZATION_LD` JSON-LD (`Organization` + `Florist` @graph). New `canonical`,
  `openGraphImage`, `buildBreadcrumb`, and `faqLd` helpers live in `/src/lib/seo.ts`
  and are applied across every routed page plus home. Functional/private routes are
  noindexed (`/cart`, `/checkout`, `/order-confirmation/[orderId]`, all `/account/*`).
  Added `/sitemap.xml` (static + product/bouquet/category/occasion/blog dynamic) and
  `/robots.txt` (blocking cart/checkout/account/order-confirmation), a custom on-brand
  `/not-found` page, Product JSON-LD (INR pricing, availability) + BreadcrumbList on
  `/flowers/[slug]` and `/bouquets/[slug]`, BreadcrumbList on `/categories/[slug]`
  and `/occasions/[slug]`, and FAQPage JSON-LD on `/faq`. Blog + city/occasion links
  were added to `SiteNav` (desktop + mobile) and a new "Flower delivery" column in
  `SiteFooter`. Alt-text audit found no raw `<img>`/`next/image` (gradient tokens only;
  all new covers carry `role="img"` + `aria-label`; new buttons have visible or
  `aria-label` text).

Note: `SITE_URL = "https://freshflower.zone"` is a placeholder assumption for
canonical/OG/sitemap/JSON-LD; the OG image targets `/og/default.png`, which the
client must supply in Phase 2's real-asset swap. `npm run lint` passes with 0 errors
(only the pre-existing unrelated `connect.ts` warning) and `npm run build` generates
**84 routes** (incl. `robots.txt` + `sitemap.xml`). Awaiting confirmation before
Phase 12.

**Phase 12 complete — admin shell.** Built the `/admin` back-office area with a
sandboxed layout entirely separate from the public site:

- **Auth**: `AdminAuthContext` (localStorage session `ff-admin-session-v1`,
  hydration-safe via the CartContext pattern) plus a login gate in
  `/src/app/admin/layout.tsx` that redirects unauthenticated visitors to
  `/admin/login` and authenticated ones away from it. `/admin/login` renders the
  legacy `LoginForm` with a clearly-labelled "Preview build — dummy auth only" box
  showing `admin@freshflower.zone` / `demo123` (TODO real auth in Phase 13).
- **Roles**: dummy `adminUsers` in `/src/lib/data/admin.ts` — super admin Aditi
  Sharma plus order/inventory/content/support managers (all `demo123`). The Phase 0
  `AdminRole` enum gates the sidebar; `src/lib/admin/navigation.ts` defines the 16
  sections across 5 groups and `visibleSections` filters them per role.
- **Chrome**: `AdminShell` gives a collapsible desktop sidebar (persisted via
  `ff-admin-sidebar-collapsed`, literal Tailwind classes only), a mobile drawer,
  and a topbar with name/role badge, "View site", and Logout. New client
  `SiteChrome` in `/src/components/sections` renders the public nav/footer only
  outside `/admin`, so the admin routes bypass the public chrome without touching
  the ~40 public routes.
- **Dashboard**: `/admin` (server metadata + noindex) renders the client
  `Dashboard` — 10 stat cards (today's/pending/confirmed/out-for-delivery/
  completed/cancelled orders, today's & monthly revenue, total customers, new
  enquiries) computed by pure helpers in `src/lib/admin/analytics.ts` from dummy
  orders/customers/enquiries, plus 4 recharts charts (7-day order & revenue
  trends, status breakdown donut, top-selling flowers). "Today" is anchored to
  the dataset's latest order day so the preview never depends on the wall clock.
- **SEO**: `/admin` added to the `robots.txt` disallow block.
- Installed `recharts` (35 packages, 0 vulnerabilities). Verified in a headless
  browser: unauth `/admin` redirects to login; demo login lands on the dashboard
  (all 10 stats + 4 charts render); Order Manager sees only Dashboard, Analytics,
  Orders, Delivery, Customers; public pages keep their nav/footer with no admin
  chrome. `npm run lint` passes with 0 errors (same unrelated `connect.ts`
  warning) and `npm run build` generates **86 routes** (incl. `/admin` +
  `/admin/login`). Awaiting confirmation before Phase 13.

**Phase 13 complete — admin catalog management (products, categories, inventory).**
Built four client screens backed by a session-only in-memory store so the demo
feels live when clicking around:

- **Store**: `src/components/providers/CatalogContext.tsx` (`CatalogProvider`
  mounted once in the admin layout, `useCatalog` hook) seeds `products` +
  `categories` from the static `/lib/data` arrays and exposes add/update/delete,
  enable/disable, stock edits, and bulk status writes. Every mutation ends with a
  `TODO(Phase 14)` comment naming the real Mongoose create/update/delete/
  updateMany call that replaces it. `stockStatus` (`In Stock / Limited Stock /
  Sold Out / Pre-order`) is the source of truth and keeps the legacy public
  flags (`inStock`/`availableToday`) in step; stock edits auto re-derive status
  (0 → Sold Out, below the 15-unit `LOW_STOCK_THRESHOLD` → Limited). Extends the
  `Flower` type with `sku`, `quantity`, `unit`, `stock`, `stockStatus`, `active`,
  `bestSeller`, `newArrival`, `seoTitle`, `metaDescription`, `keywords` and syncs
  the same fields into `/src/lib/db/schemas.ts`. Added `slugify` to `/lib/utils`.
- **`/admin/products`** (`ProductsManager`): 12 seeded flowers in a table with
  gradient thumbnail, name/slug, category, price (+ sale strikethrough), qty/unit,
  stock (gold when low), StatusBadge, flag chips (Featured/Best seller/New
  arrival), and Edit / Disable-Enable / two-step Delete actions; live search and
  category + status filters; summary line of total/low/disabled counts; resource
  state with "New product" link. `data-product-row` hooks for QA.
- **`/admin/products/new` + `/admin/products/[id]/edit`** (`ProductForm`): every
  field from the brief — name (slug auto-generates, still editable, with a
  regenerate wand), category, short + full description, price, sale price, SKU,
  quantity, unit, stock, availability-status toggles, featured/best-seller/
  new-arrival switches, a dummy image uploader that previews picked files as
  local object URLs (and keeps existing gradient tokens), and SEO title / meta
  description / keywords. Slug-uniqueness and required-field validation with
  inline errors; saving redirects back to the list.
- **`/admin/categories`** (`CategoriesManager`): list with gradient hero tile,
  slug/description, live product count, up/down reorder buttons, edit + delete
  in a Modal (name → auto slug preview, description). Deletion is blocked and
  disabled with an explanatory title while a category still contains products.
- **`/admin/inventory`** (`InventoryManager`): stock table with row selection,
  inline stock number input + quick ±10/±5/±1 buttons, per-row availability-
  today switch and status select, low-stock rows highlighted (blush) and sold-out
  rows muted, "low stock only" filter + search (name/slug/SKU) + category filter,
  and a bulk action bar over the selection with Mark Available Today / Limited
  Stock / Sold Out in one click.
- Added a **Categories** section (FolderKanban icon, Catalogue group,
  InventoryManager role) to the admin sidebar. All five new routes are noindexed
  server wrappers with metadata. Verified headless in a browser: 12 product rows
  filtered by "orchid" to 1; created "Test Bloom (5 stems)" — auto slug, featured
  + new-arrival flags, saved at ₹649 and listed; categories 9 → 10 → 9 with
  blocked (Roses, 2 products) vs allowed (empty Gardenias) deletion and working
  reorder; inventory inline 0 → Sold Out, +1 delta, bulk sold-out on two selected
  rows with the selection clearing. `npm run lint` passes with 0 errors (same
  unrelated `connect.ts` warning) and `npm run build` generates **90 routes**.
  Awaiting confirmation before Phase 14.

**Phase 14 complete — admin orders & delivery management.** Built the
operations screens plus a customer-facing tracking page, with cross-page
persistence for live-feel overrides:

- **Store**: `src/components/providers/OperationsContext.tsx`
  (`OperationsProvider`, mounted in the admin layout beside `CatalogProvider`)
  seeds orders/slots/areas from static `/lib/data` and re-hydrates from two
  localStorage override keys. Status/payment writes persist to
  `ff-order-status-overrides-v1`; slot + area edits persist a full snapshot of
  slot `enabled`/`maxOrders` and area records to `ff-delivery-config-v1`
  (`src/lib/admin/overrides.ts`, window-guarded for SSR). Mutations carry
  `TODO(Phase 15)` Mongoose comments. Extends the `Order` type with optional
  `paymentStatus` (`paid`/`pending`/`refunded`) and `paymentMethod`
  (`online`/`cod`); dummy orders now carry real payment values and both fields
  are synced into `/src/lib/db/schemas.ts` (plus `maxOrders`/`enabled` on the
  slot schema).
- **`/admin/orders`** (`OrdersManager`): order table (order number, customer
  name + phone, items summary, delivery date/slot/area, payment method + badge,
  IR total, status) with live search (order number/customer/phone), status
  filter, date-range filter, and Today / Tomorrow / All quick chips; row links
  to the detail page. `data-order-row` hooks for QA.
- **`/admin/orders/[id]`** (`OrderDetail`): full order card — customer info,
  itemized lines, coupon + totals breakdown, notes, delivery address — beside
  a status panel with instant order-status and payment-status selects that
  persist overrides immediately, plus a "View on track-order" deep link.
  `data-status-select` / `data-payment-select`.
- **`/admin/delivery`** (`DeliveryManager`, three tabs): **Areas** — add/edit/
  delete service areas with inline name/pincodes/fee/minutes and an active
  toggle; **Slots** — enable/disable each of the 7 slots, set `maxOrders`,
  live "today" usage count and an Open / Full / Disabled state chip; **Coverage**
  — stat cards (total/active areas, pincodes covered, slots full/off today),
  an active-coverage bar, and area cards with pincode chips
  (`data-area-row`, `data-slot-row`, `data-area-card`).
- **Customer tracking**: new `/track-order` page (`TrackOrderClient`) with
  order-number lookup that renders the existing `OrderStatusStepper`, items,
  totals, delivery slot/date, address, and payment status — reading the same
  status overrides, so admin changes reflect instantly. Linked "Track order" in
  the footer's Company column.
- **Checkout wiring**: `getSlotAvailability` in `/src/lib/delivery.ts` is now
  capacity-based (non-cancelled orders per slot vs `maxOrders`,
  `DEFAULT_MAX_ORDERS = 3`) instead of hash-random; `CheckoutClient` hydrates
  `ff-delivery-config-v1` and passes slot capacities, hidden disabled slots
  (new `hiddenSlotIds` prop on `DeliverySlotSelector`), and admin-active area
  pin coverage into the pincode check — so changing `maxOrders` or disabling an
  area in the admin flips the public checkout's "Available/Full" and
  serviceability states. Other slot-selector call sites keep the capacity
  defaults.
- Verified headless: orders table renders 6; Today → 2 (FF-1002/FF-1003);
  status=Delivered → 1; FF-1002 detail loads; status → delivered + payment →
  paid persist to the override key; `/track-order?order=FF-1002` then shows the
  Delivered stepper; slot-10-11 `maxOrders=1` (it has 1 order today) makes that
  slot **Full** while slot-9-10 stays Available in checkout; disabling South
  Extension makes pincode 110049 "Currently unavailable"; Coverage tab shows 9
  area cards. 0 console errors. `npm run lint` passes with 0 errors (same
  unrelated `connect.ts` warning) and `npm run build` generates **94 routes**.
  Awaiting confirmation before Phase 15.

**Client follow-up — real photography (client-supplied):** Replaced gradient
placeholder tiles with the client's real image URLs for the homepage **Shop by
category** (Roses, Gerbera, Mogra, Sunflower, Carnations, Orchid — new
`Category.imageUrl`, `CategorySchema` keeps mirror), and for product photography
on **Best sellers** + **Picked this morning** (Red Rose Bunch → giftlaya,
White Rose Bunch → gstatic, Mixed Gerbera → gstatic, Mogra Gajra → amazon,
Sunflower Bunch → amazon, Phalaenopsis Orchid Plant → suluzorchids; set as
`Flower.images[0]`, which also feeds `/flowers/[slug]` gallery, quick view
modals, and wishlist tiles). Added `isRemoteImage()` in `/src/lib/utils.ts` and
remote-aware `<Image>` rendering in `ProductCard`, `HomepageClient` (quick view
+ category tiles), `FlowersCatalogue` quick view, `FlowerDetailClient`
(main/thumbnails/lightbox; gallery now leads with real primary photo then
gradients), `AccountContent` wishlist. `next.config.ts` `images.remotePatterns`
now allows: `api.floraindia.com`, `encrypted-tbn0.gstatic.com`,
`www.gardendesign.com`, `m.media-amazon.com`, `cdn.giftlaya.com`,
`suluzorchids.com`. Remaining categories (Lily, Rajnigandha, Baby's Breath) and
all bouquets stay on gradients. Verified headless: homepage renders 14 photo
images across the three sections on the 6 expected hosts (0 console errors);
Mogra + Red Rose detail pages show a loaded main photo (640px decoded); lint 0
errors (same `connect.ts` warning); build still **94 routes**. Note: gstatic
thumbnail URLs are signed and may expire; phases gain real hosted assets.
Extending the same photography pass to the homepage **Flowers by occasion**
section (`occasionImages` map in HomepageClient): Anniversary (vecteezy),
Birthday (amazon), Wedding (gstatic), Gifting (unsplash) tiles now render
photo cards with a dark scrim label; the fifth tile (Romance) keeps its
lavender chip. `images.remotePatterns` also allows `static.vecteezy.com` +
`plus.unsplash.com`. Verified headless: 4 photos on those hosts, Romance chip
present, 0 console errors; build still **94 routes**. Romance has since been
given a photo (gstatic) too — all five occasion tiles are now photo cards. The
homepage **From our studio** Instagram gallery (`galleryTokens` in
HomepageClient) also swapped its 6 gradient tiles for client photos (jdmagicbox,
gstatic ×2, pngtree, fiorellaindia, simpleviewinc); `images.remotePatterns`
allows those hosts. Verified headless: 6 photos decode, `@freshflower.zone`
pill intact, 0 console errors. Homepage FAQ section (`/faq` link retained) now
renders only the first 3 FAQs (`faqs.slice(0, 3)`), still above the footer.
Hero section now plays `public/assets/video/bg1.mp4` (local, 949 KB, 1366×768)
as a full-bleed autoplay background via `<video autoPlay muted loop
playsInline>` with an `bg-ivory/40` scrim so it stays clearly visible under the
headline; decorative glass circles float above it. Verified headless:
readyState 4, autoplaying (frame advance confirmed), visible, 0 console errors.

**Quick view + cart UX pass.** Build new `QuickViewDialog` (`src/components/
sections/QuickViewDialog.tsx`), used by homepage, `/flowers` catalogue, and the
flower detail page's related/similar blooms (replaces the old `ProductQuickView`):
two-column modal (photo left, details/actions right; single column on mobile),
compact image + status badge, quantity stepper, `Add {n} to cart`, `View full
details →` link. `Modal` now caps at `max-h-[88vh]` with `overflow-y-auto` so
action buttons are never hidden under the image. Add-to-cart is now real cart
state everywhere: quick view, category/product cards (`ProductCard`, bouquet
cards), and the flower/bouquet detail pages all call `CartContext.addItem` (the
detail-page "Add to cart"/"Buy now" previously only faked a preview counter —
now they actually add the item, so Buy Now reaches a populated checkout). New
`CartAddedToast` in `CartContext` shows an auto-dismissing bottom-center popup
("{name} ×N added to cart") on every add. `SiteNav` cart icon now renders a
count badge from `useCart().itemCount`. Cart persists via `freshflower-cart` in
localStorage. Verified headless: quick-view modal fits viewport with all
controls visible, toast fires, badge increments 1 → 2 across page loads, 0
console errors.
