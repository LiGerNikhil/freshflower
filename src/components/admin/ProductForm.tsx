"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Palette, Plus, Save, Trash2, WandSparkles } from "lucide-react";
import { useCatalog, FLOWER_STATUS_LABELS, FLOWER_UNITS } from "@/components/providers/CatalogContext";
import { CloudinaryUpload } from "@/components/admin/CloudinaryUpload";
import { slugify } from "@/lib/utils";
import type { ColorVariant, FlowerStockStatus } from "@/lib/types";

const STATUS_OPTIONS = (Object.keys(FLOWER_STATUS_LABELS) as FlowerStockStatus[]).map(
  (status) => ({ value: status, label: FLOWER_STATUS_LABELS[status] }),
);

interface FormErrors {
  name?: string;
  slug?: string;
  categoryId?: string;
  price?: string;
  quantity?: string;
  colorVariants?: Record<number, { color?: string; price?: string }>;
}

const EMPTY_VARIANT: ColorVariant = { color: "", price: NaN };

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
        checked ? "bg-sage text-sage-ink" : "bg-ink/5 text-ink-soft hover:bg-ink/10"
      }`}
    >
      {label}
    </button>
  );
}

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const { products, categories, addProduct, updateProduct } = useCatalog();

  const existing = useMemo(
    () =>
      products.find(
        (flower) =>
          flower.id === productId ||
          flower.slug === productId ||
          flower.id === `fl-${productId}`,
      ),
    [products, productId],
  );

  const [name, setName] = useState(existing?.name ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [shortDescription, setShortDescription] = useState(
    existing?.shortDescription ?? "",
  );
  const [price, setPrice] = useState(existing?.price ?? 0);
  const [originalPrice, setOriginalPrice] = useState((existing?.compareAtPrice ?? 0).toString());
  const [quantity, setQuantity] = useState(existing?.quantity ?? 1);
  const [unit, setUnit] = useState(existing?.unit ?? "Stems");
  const [stock, setStock] = useState(existing?.stock ?? 24);
  const [sku, setSku] = useState(existing?.sku ?? "");
  const [stockStatus, setStockStatus] = useState<FlowerStockStatus>(
    existing?.stockStatus ?? "in-stock",
  );
  const [featured, setFeatured] = useState(existing?.featured ?? false);
  const [bestSeller, setBestSeller] = useState(existing?.bestSeller ?? false);
  const [newArrival, setNewArrival] = useState(existing?.newArrival ?? false);
  const [images, setImages] = useState<string[]>(existing?.images ?? []);
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>(
    (existing?.colorVariants ?? []).map((variant) => ({ ...variant })),
  );
  const [videos, setVideos] = useState<string[]>(existing?.videos ?? []);
  const [seoTitle, setSeoTitle] = useState(existing?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(existing?.metaDescription ?? "");
  const [keywords, setKeywords] = useState((existing?.keywords ?? []).join(", "));
  const [errors, setErrors] = useState<FormErrors>({});
  const [saved, setSaved] = useState(false);

  if (productId && !existing) {
    return (
      <div className="rounded-xl border border-ink/10 bg-white/80 p-10 text-center shadow-sm">
        <p className="font-display text-xl text-ink">Product not found.</p>
        <p className="mt-1 text-sm text-ink-soft">
          It may have been deleted in this session.
        </p>
        <Link
          href="/admin/products"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm text-ivory hover:bg-ink-soft"
        >
          <ArrowLeft size={14} /> Back to products
        </Link>
      </div>
    );
  }

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Name is required.";
    const finalSlug = slug.trim() || slugify(name);
    if (!finalSlug) next.slug = "A valid slug is required.";
    else if (
      products.some(
        (flower) => flower.slug === finalSlug && flower.id !== existing?.id,
      )
    ) {
      next.slug = `Slug "${finalSlug}" is already in use.`;
    }
    if (!categoryId) next.categoryId = "Choose a category.";
    if (!(price >= 0) || Number.isNaN(price)) next.price = "Enter a price ≥ 0.";
    if (!(quantity >= 1) || Number.isNaN(quantity)) next.quantity = "Quantity must be at least 1.";
    const variantBlanks: NonNullable<FormErrors["colorVariants"]> = {};
    colorVariants.forEach((variant, index) => {
      if (!variant.color.trim()) {
        variantBlanks[index] = { ...(variantBlanks[index] ?? {}), color: `Name the colour for row ${index + 1}.` };
      }
      if (!variant.color && Number.isNaN(variant.price)) {
        return;
      }
      if (Number.isNaN(variant.price) || !(variant.price >= 0)) {
        variantBlanks[index] = { ...(variantBlanks[index] ?? {}), price: `Enter a price ≥ 0 for ${variant.color.trim() || `row ${index + 1}`}.` };
      }
    });
    if (Object.keys(variantBlanks).length) next.colorVariants = variantBlanks;
    return next;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    const draft = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      categoryId,
      description,
      shortDescription,
      price: Number(price),
      salePrice: Number(originalPrice) || 0,
      quantity: Number(quantity),
      unit,
      stock: Number(stock) || 0,
      sku: sku.trim(),
      stockStatus,
      featured,
      bestSeller,
      newArrival,
      colors: [],
      colorVariants: colorVariants
        .filter((variant) => variant.color.trim() && !Number.isNaN(variant.price))
        .map((variant) => ({
          color: variant.color.trim(),
          price: Number(variant.price),
          image: variant.image?.trim() || undefined,
          compareAtPrice:
            variant.compareAtPrice && !Number.isNaN(variant.compareAtPrice)
              ? Number(variant.compareAtPrice)
              : undefined,
        })),
      images,
      videos,
      seoTitle: seoTitle.trim(),
      metaDescription: metaDescription.trim(),
      keywords: keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    };
    if (productId) {
      updateProduct(existing?.id ?? productId, draft);
    } else {
      addProduct(draft);
    }
    setSaved(true);
    window.setTimeout(() => router.push("/admin/products"), 450);
  };

  const fieldClass =
    "w-full rounded-md border border-ink/10 bg-white/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:ring-2 focus:ring-gold/60 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
            {productId ? "Catalogue" : "Catalogue"} · Products
          </p>
          <h1 className="mt-2 font-display text-3xl md:text-4xl">
            {productId ? "Edit product" : "New product"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Saves persist straight to MongoDB via the admin API, so a refresh
            keeps your changes.
          </p>
        </div>
        {saved && (
          <span className="rounded-md bg-sage px-3 py-1.5 text-sm font-semibold text-sage-ink">
            Saved — redirecting…
          </span>
        )}
      </div>

      {/* Basics */}
      <section className="mb-6 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg">Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Name
            </span>
            <input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setSlug(slugify(event.target.value));
              }}
              placeholder="e.g. Pink Rose Bunch (12 stems)"
              className={fieldClass}
            />
            {errors.name && <span className="mt-1 block text-xs text-ink">{errors.name}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Slug
            </span>
            <div className="flex gap-2">
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder={slugify(name)}
                className={fieldClass}
              />
              <button
                type="button"
                onClick={() => setSlug(slugify(name))}
                aria-label="Regenerate slug from name"
                title="Regenerate from name"
                className="shrink-0 rounded-md border border-ink/10 px-3 text-ink-soft hover:bg-ink/5"
              >
                <WandSparkles size={15} />
              </button>
            </div>
            {errors.slug && <span className="mt-1 block text-xs text-ink">{errors.slug}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Category
            </span>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={fieldClass}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span className="mt-1 block text-xs text-ink">{errors.categoryId}</span>
            )}
          </label>
          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Short description
            </span>
            <textarea
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              rows={2}
              placeholder="One crisp line shown on product cards."
              className={fieldClass}
            />
          </label>
          <label className="sm:col-span-2 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Full description
            </span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={4}
              placeholder="The product story shown on the detail page."
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      {/* Pricing & inventory */}
      <section className="mb-6 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg">Pricing &amp; inventory</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Selling price (₹)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              className={fieldClass}
            />
            {errors.price && <span className="mt-1 block text-xs text-ink">{errors.price}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Original price (₹)
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={originalPrice}
              onChange={(event) => setOriginalPrice(event.target.value)}
              placeholder="Optional, for analytics/strike-through"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              SKU
            </span>
            <input
              value={sku}
              onChange={(event) => setSku(event.target.value)}
              placeholder="SKU-REDROSE12"
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Quantity per unit
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              className={fieldClass}
            />
            {errors.quantity && (
              <span className="mt-1 block text-xs text-ink">{errors.quantity}</span>
            )}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Unit
            </span>
            <select
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              className={fieldClass}
            >
              {FLOWER_UNITS.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {candidate}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Stock count
            </span>
            <input
              type="number"
              min={0}
              step={1}
              value={stock}
              onChange={(event) => setStock(Number(event.target.value))}
              className={fieldClass}
            />
          </label>
        </div>

        <div className="mt-5">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Availability status
          </span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <Toggle
                key={option.value}
                checked={stockStatus === option.value}
                onChange={() => setStockStatus(option.value)}
                label={option.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Colour variants */}
      <section className="mb-6 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Palette size={16} className="text-gold" />
          <h2 className="font-display text-lg">Colour variants</h2>
        </div>
        <p className="mb-4 text-sm text-ink-soft">
          Give each colour its own price and image. Customers pick a colour on
          the product page — the selected colour&apos;s price and picture are
          used everywhere from cart to the admin order view. Leave empty for
          single-colour products.
        </p>

        {colorVariants.length > 0 && (
          <div className="space-y-4">
            {colorVariants.map((variant, index) => (
              <div
                key={index}
                className="rounded-lg border border-ink/10 bg-ivory/60 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-soft">
                    Colour {index + 1}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove colour ${index + 1}`}
                    onClick={() =>
                      setColorVariants((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="rounded-md border border-ink/10 px-2 py-1 text-ink-soft hover:bg-blush hover:text-ink"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                      Colour
                    </span>
                    <input
                      value={variant.color}
                      onChange={(event) =>
                        setColorVariants((prev) =>
                          prev.map((entry, i) =>
                            i === index
                              ? { ...entry, color: event.target.value }
                              : entry,
                          ),
                        )
                      }
                      placeholder="e.g. Red, Pink, White…"
                      className={fieldClass}
                    />
                    {errors.colorVariants?.[index]?.color && (
                      <span className="mt-1 block text-xs text-ink">
                        {errors.colorVariants[index]?.color}
                      </span>
                    )}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                      Price (₹)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={Number.isNaN(variant.price) ? "" : variant.price}
                      onChange={(event) =>
                        setColorVariants((prev) =>
                          prev.map((entry, i) =>
                            i === index
                              ? {
                                  ...entry,
                                  price: event.target.value
                                    ? Number(event.target.value)
                                    : NaN,
                                }
                              : entry,
                          ),
                        )
                      }
                      placeholder="e.g. 349"
                      className={fieldClass}
                    />
                    {errors.colorVariants?.[index]?.price && (
                      <span className="mt-1 block text-xs text-ink">
                        {errors.colorVariants[index]?.price}
                      </span>
                    )}
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                      Compare-at price (₹)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={
                        variant.compareAtPrice && !Number.isNaN(variant.compareAtPrice)
                          ? variant.compareAtPrice
                          : ""
                      }
                      onChange={(event) =>
                        setColorVariants((prev) =>
                          prev.map((entry, i) =>
                            i === index
                              ? {
                                  ...entry,
                                  compareAtPrice: event.target.value
                                    ? Number(event.target.value)
                                    : NaN,
                                }
                              : entry,
                          ),
                        )
                      }
                      placeholder="Optional"
                      className={fieldClass}
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                    Colour image
                  </span>
                  <CloudinaryUpload
                    value={
                      variant.image
                        ? [variant.image]
                        : []
                    }
                    onChange={(urls) =>
                      setColorVariants((prev) =>
                        prev.map((entry, i) =>
                          i === index
                            ? { ...entry, image: urls[urls.length - 1] ?? entry.image }
                            : entry,
                        ),
                      )
                    }
                    label="Add colour image"
                    mediaType="image"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setColorVariants((prev) => [...prev, { ...EMPTY_VARIANT }])
          }
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-dashed border-ink/25 px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-gold hover:text-ink"
        >
          <Plus size={15} /> Add colour
        </button>
      </section>

      {/* Flags */}
      <section className="mb-6 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg">Merchandising flags</h2>
        <div className="flex flex-wrap gap-2">
          <Toggle checked={featured} onChange={setFeatured} label="Featured" />
          <Toggle checked={bestSeller} onChange={setBestSeller} label="Best seller" />
          <Toggle checked={newArrival} onChange={setNewArrival} label="New arrival" />
        </div>
      </section>

      {/* Media */}
      <section className="mb-6 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg">Media</h2>
        <p className="mb-3 text-sm text-ink-soft">
          Upload images and product videos to Cloudinary. Both are stored with
          the product on the next save.
        </p>
        <CloudinaryUpload
          value={images}
          onChange={setImages}
          label="Add images"
          mediaType="image"
        />
        <div className="mt-5">
          <CloudinaryUpload
            value={videos}
            onChange={setVideos}
            label="Add videos"
            mediaType="video"
          />
        </div>
        {videos.length > 0 && (
          <p className="mt-3 text-xs text-ink-soft">
            Product cards still use the first image as the thumbnail; videos are
            available on the product detail media gallery.
          </p>
        )}
      </section>

      {/* SEO */}
      <section className="mb-8 rounded-xl border border-ink/10 bg-white/80 p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg">Search engine optimisation</h2>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              SEO title
            </span>
            <input
              value={seoTitle}
              onChange={(event) => setSeoTitle(event.target.value)}
              placeholder={name || "Title tag"}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Meta description
            </span>
            <textarea
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
              rows={2}
              placeholder="150-160 characters for search snippets."
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              Keywords
            </span>
            <input
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="red roses, anniversary flowers, same-day"
              className={fieldClass}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={15} /> Cancel
        </Link>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-[15px] font-medium text-ivory transition hover:bg-ink-soft"
        >
          <Save size={16} /> {productId ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
