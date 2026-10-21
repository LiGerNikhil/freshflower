# Festival catalogue — Phase 1

## Commands

```powershell
npx tsx scripts/test-festival-data.ts
npx tsx scripts/seed-festivals.ts --dry-run
# Explicit writes after reviewing the dry run:
npx tsx scripts/seed-festivals.ts --apply
```

The default is a read-only dry run. Environment variables are loaded from
`.env.local`, then `.env`, without replacing process environment variables.
The existing `dbConnect()` helper is used; credentials are never printed.
Dry runs disable Mongoose automatic collection/index creation.

## Preservation and reruns

- Match existing catalogue records by slug, explicit aliases and normalized name.
- Ambiguous matches or ID collisions stop the entire plan before seed writes.
- Existing products/categories/collections are never updated, even if prices,
  packaging, images, stock, timestamps or publication state differ.
- Inserts use a slug filter, `$setOnInsert`, and disabled update timestamps/default
  injection. Unique slug indexes prevent duplicate slugs. There are no deletes or
  index drops. Interrupted runs can be rerun.
- New products have zero stock, no images, `active:false` and
  `publicationStatus:"draft"`. New categories are inactive with no real image.
- New collections are inactive drafts without banners or schedule dates. Ordered
  product references include matched existing IDs; existing product tags are not
  changed. Six collections include Govardhan Puja from the business brief.
- Homepage config is left untouched. Existing HomepageConfig is extended, not
  replaced; festival hero and sales switches default off.
- Do not use the general `npm run seed` for this feature: its `$set` behaviour
  would overwrite existing catalogue records.

Phase 1 only ran the read-only report. Phase 5 completed public draft exclusion
across the storefront catalogue and festival collection routes. Still review a
fresh dry run and test an apply/rerun in a suitable environment before shared DB
use.

## Phase 1 snapshot of database comparison

15 missing products, 11 existing products matched, 4 missing categories, 6 draft
collections. No ambiguous matches. Prices are INR, checked against stored base
and colour-variant prices (not compare-at prices).

| Existing product | Base price | Variant prices | Client sheet |
| --- | ---: | --- | ---: |
| Bangalore Rose | 499 | All 499 | 449 |
| Gerbera | 279 | All 279 | 249 |
| Sunflower | 499 | None | 349 |
| Daisy | 549 | White/Pink 549; Purple 599 | 499 |
| Baby's Breath | 399 | None | 349 |
| Carnations | 399 | Pink/Red/Yellow 299; White 399 | 399 |
| Orchid | 499 | All 499 | 449 |
| Asiatic Lily | 1499 | All 1499 | 1299 |
| Oriental Lily | 1899 | All 1899 | 1999 |

Mogra matches at 299 for 100 gm; Rajnigandha matches at 649 for 24 sticks.
Package-label review: Rajnigandha uses `sticks` versus `pcs`, Gerbera uses `Stems`
versus `pcs`, Asiatic Lily does not record the `30+ buds` claim in its unit label,
and Oriental Lily currently renders the stored package as `10 10/30+`.
No correction is automatically applied. Run a fresh dry run before deciding prices.

Missing products: six garland/string products, orange/yellow loose marigold,
loose rose, white chrysanthemum, pink/blue lotus, lisianthus, hydrangea, gladiolus.
Missing categories: Garlands & Malas, Loose Flowers & Petals, Lotus, Exotic & Cut
Flowers (fallback only where an existing specific category cannot be reused).

## Contracts for later phases

- `quantity` remains package contents. `minQuantity`/`quantityStep` are purchase
  units and default to 1. Kilograms initially use whole 1 kg purchases.
- `unitLabel` is the complete display text; order items optionally snapshot it.
- `isFestivalCollectionLive()` checks start inclusive/end exclusive as instants;
  admin should edit schedules in Asia/Kolkata. Missing dates never go live.
- Publishing validation requires schedule dates, a Cloudinary banner, and at
  least one product/category reference. PATCH routes must validate the merged
  result with `festivalCollectionUpsertSchema`, then check references in MongoDB.
- Existing products lacking publication fields retain legacy visibility semantics.
  Public catalogue and collection reads exclude explicit drafts.
- `lastOrderByText` is display copy, not an enforced checkout deadline.
- Delivery/advance-payment fields are data only until Phase 6 enforces them through
  the existing checkout. The Porter fee calculation is unchanged.
