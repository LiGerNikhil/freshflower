import { z } from "zod";
import { FESTIVAL_BADGES, HOMEPAGE_SECTION_IDS } from "@/lib/festivals";
import { TIERED_DISCOUNT_ABSOLUTE_CAP } from "@/lib/discounts";

/** Shared zod schemas for every write surface (admin + public). */

export const productUpsertSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug."),
  categoryId: z.string().trim().min(1),
  description: z.string().max(20_000).default(""),
  shortDescription: z.string().max(500).default(""),
  price: z.number().finite().min(0),
  salePrice: z.number().finite().min(0).max(9_999_999).default(0),
  compareAtPrice: z.number().finite().min(0).max(9_999_999).nullable().optional(),
  inStock: z.boolean().optional(),
  availableToday: z.boolean().optional(),
  occasionIds: z.array(z.string()).max(24).optional(),
  quantity: z.number().int().min(1).max(100_000).default(1),
  unit: z.string().max(24).default("Stems"),
  stock: z.number().int().min(0).max(1_000_000).default(0),
  sku: z.string().max(64).default(""),
  stockStatus: z
    .enum(["in-stock", "limited", "sold-out", "pre-order"])
    .default("in-stock"),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  colors: z.array(z.string().max(60)).max(24).default(["mixed"]),
  colorVariants: z
    .array(
      z.object({
        color: z.string().trim().min(1).max(60),
        price: z.number().finite().min(0),
        image: z.string().max(1000).optional(),
        compareAtPrice: z.number().finite().min(0).optional(),
      }),
    )
    .max(24)
    .default([]),
  images: z.array(z.string().max(1000)).max(24).default(["gradient-ivory"]),
  videos: z.array(z.string().max(1000)).max(12).default([]),
  seoTitle: z.string().max(160).default(""),
  metaDescription: z.string().max(320).default(""),
  keywords: z.array(z.string().max(60)).max(30).default([]),
  active: z.boolean().default(true),
  publicationStatus: z.enum(["draft", "published"]).optional(),
  unitLabel: z.string().trim().max(80).optional(),
  minQuantity: z.number().int().min(1).max(99).optional(),
  quantityStep: z.number().int().min(1).max(99).optional(),
  festivalTags: z.array(z.string().trim().min(1).max(60)).max(24).optional(),
  badges: z.array(z.enum(FESTIVAL_BADGES)).max(3).optional(),
  poojaEligible: z.boolean().optional(),
  requiresAdvancePayment: z.boolean().optional(),
  deliveryPolicy: z.enum(["standard", "pooja-morning"]).optional(),
  occassionIds: z.array(z.string()).max(24).optional(),
});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

/** Looser patch form used by quick admin edits (stock/status/active toggles). */
export const productPatchSchema = productUpsertSchema.partial();

/** Zod defaults must not turn a small PATCH into a replacement document. */
export function explicitPatch<T extends Record<string, unknown>>(parsed: T, raw: Record<string, unknown>): Partial<T> {
  return Object.fromEntries(Object.entries(parsed).filter(([key]) => Object.prototype.hasOwnProperty.call(raw, key))) as Partial<T>;
}

export const bouquetUpsertSchema = z.object({
  name: z.string().trim().min(1, "Bouquet name is required.").max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug."),
  description: z.string().max(20_000).default(""),
  items: z.array(z.object({
    flowerId: z.string().trim().min(1),
    quantity: z.number().int().min(1).max(100_000),
  })).max(100).default([])
    .refine((items) => new Set(items.map((item) => item.flowerId)).size === items.length, "A flower can only be added once."),
  price: z.number().finite().min(0).max(9_999_999),
  images: z.array(z.string().url().max(1000)).min(1, "Upload at least one bouquet image.").max(12),
  colors: z.array(z.string().trim().min(1).max(60)).max(24).default([])
    .refine((colors) => new Set(colors.map((color) => color.toLowerCase())).size === colors.length, "Bouquet colors must be unique."),
  occasionIds: z.array(z.string().trim().min(1)).max(24).default([]),
  featured: z.boolean().default(false),
});

export const bouquetPatchSchema = bouquetUpsertSchema.partial();

export const categoryPatchSchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80),
  description: z.string().max(1000).default(""),
  heroImage: z.string().max(1000).optional(),
  sortOrder: z.number().int().optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  imageUrl: z.string().url().max(1000).or(z.literal("")).optional(),
  active: z.boolean().optional(),
  seoTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  keywords: z.array(z.string().max(60)).max(30).optional(),
});

const orderedIdsSchema = z.array(z.string().trim().min(1).max(120)).max(200)
  .refine((ids) => new Set(ids).size === ids.length, "Duplicate references are not allowed.");

const advanceBookingProductSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
  displayLabel: z.string().trim().max(120).optional(),
  promotionalDescription: z.string().max(500).optional(),
  minQuantity: z.number().int().min(1).max(99).default(1),
  maxQuantity: z.number().int().min(1).max(999).default(99),
  bulkOrderEligible: z.boolean().default(false),
  eligibleVariants: z.array(z.string().trim().min(1).max(60)).max(24).default([]),
}).refine((value) => value.maxQuantity >= value.minQuantity, {
  path: ["maxQuantity"],
  message: "Maximum quantity must be at least the minimum quantity.",
});

const campaignDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value;
}, "Enter a valid calendar date.");

const advanceBookingSchema = z.object({
  description: z.string().max(2000).default(""),
  announcement: z.string().max(240).default(""),
  primaryCtaLabel: z.string().trim().min(1).max(60).default("Book Your Diwali Flowers"),
  secondaryCtaLabel: z.string().trim().min(1).max(60).default("Explore Diwali Collection"),
  bookingCutoffAt: z.string().datetime({ offset: true }).optional(),
  deliveryDates: z.array(campaignDateSchema).max(31).default([])
    .refine((dates) => new Set(dates).size === dates.length, "Delivery dates must be unique."),
  deliveryTimePreferences: z.array(z.string().trim().min(1).max(80)).max(24).default([])
    .refine((times) => new Set(times).size === times.length, "Delivery windows must be unique."),
  deliveryAreaIds: orderedIdsSchema.default([]),
  dailyBookingLimit: z.number().int().min(0).max(10_000).default(0),
  earlyMorningDelivery: z.boolean().default(false),
  customRequirementsEnabled: z.boolean().default(true),
  productSettings: z.array(advanceBookingProductSchema).max(200).default([])
    .refine((settings) => new Set(settings.map((item) => item.productId)).size === settings.length, "Campaign product settings must be unique."),
});

const festivalCollectionFields = z.object({
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  subtitle: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
  bannerImage: z.string().url().max(1000).or(z.literal("")).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  active: z.boolean().default(false),
  startsAt: z.string().datetime({ offset: true }).nullish().transform((value) => value ?? undefined),
  endsAt: z.string().datetime({ offset: true }).nullish().transform((value) => value ?? undefined),
  productIds: orderedIdsSchema.default([]),
  categoryIds: orderedIdsSchema.default([]),
  sortOrder: z.number().int().min(0).default(0),
  badgeText: z.string().max(60).optional(),
  lastOrderByText: z.string().max(160).optional(),
  poojaCollection: z.boolean().default(false),
  whatsappBulkOrderEnabled: z.boolean().default(false),
  seoTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  keywords: z.array(z.string().max(60)).max(30).default([]),
  advanceBooking: advanceBookingSchema.optional(),
});

export const festivalCollectionUpsertSchema = festivalCollectionFields.superRefine((value, ctx) => {
  if (value.active && value.status === "draft") {
    ctx.addIssue({ code: "custom", path: ["active"], message: "Publish this draft before activating it." });
  }
  if (value.startsAt && value.endsAt && Date.parse(value.endsAt) <= Date.parse(value.startsAt)) {
    ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after start." });
  }
  if (value.status === "published") {
    if (!value.startsAt || !value.endsAt) {
      ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Published collections require both schedule dates." });
    }
    if (!value.bannerImage || !/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(value.bannerImage)) {
      ctx.addIssue({ code: "custom", path: ["bannerImage"], message: "Upload a Cloudinary banner before publishing." });
    }
    if (!value.productIds.length && !value.categoryIds.length) {
      ctx.addIssue({ code: "custom", path: ["productIds"], message: "Select products or categories before publishing." });
    }
  }
});

// PATCH handlers must validate the merged document with the full schema as well.
export const festivalCollectionPatchSchema = festivalCollectionFields.extend({
  status: festivalCollectionFields.shape.status.removeDefault(),
  active: festivalCollectionFields.shape.active.removeDefault(),
  productIds: festivalCollectionFields.shape.productIds.removeDefault(),
  categoryIds: festivalCollectionFields.shape.categoryIds.removeDefault(),
  sortOrder: festivalCollectionFields.shape.sortOrder.removeDefault(),
  poojaCollection: festivalCollectionFields.shape.poojaCollection.removeDefault(),
  whatsappBulkOrderEnabled: festivalCollectionFields.shape.whatsappBulkOrderEnabled.removeDefault(),
  keywords: festivalCollectionFields.shape.keywords.removeDefault(),
}).partial();

export const diwaliBookingUpsertSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
    whatsapp: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit WhatsApp number.").optional().or(z.literal("")),
    email: z.string().trim().email().max(254).optional().or(z.literal("")),
  }),
  items: z.array(z.object({
    productId: z.string().trim().min(1).max(120),
    variant: z.string().trim().min(1).max(60).optional(),
    quantity: z.number().int().min(1).max(999),
  })).min(1).max(50),
  deliveryDate: campaignDateSchema,
  deliveryTimePreference: z.string().trim().min(1).max(80),
  deliveryAreaId: z.string().trim().min(1).max(120),
  address: z.string().trim().min(5).max(300),
  locality: z.string().trim().min(2).max(120),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code."),
  specialInstructions: z.string().trim().max(1000).optional(),
  customRequirements: z.string().trim().max(2000).optional(),
}).refine((value) => new Set(value.items.map((item) => `${item.productId}:${item.variant ?? ""}`)).size === value.items.length, {
  path: ["items"],
  message: "Remove duplicate product and variant selections.",
});

export const diwaliBookingPatchSchema = z.object({
  status: z.enum(["new_request", "under_review", "availability_confirmed", "awaiting_payment", "confirmed", "fulfilled", "cancelled", "rejected"]).optional(),
  internalNotes: z.string().max(4000).optional(),
}).refine((value) => Object.keys(value).length > 0, "Provide a booking status or internal note.");

export const homepageSectionSchema = z.object({
  id: z.enum(HOMEPAGE_SECTION_IDS),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0),
});

export const couponSchema = z.object({
  id: z.string().min(4).regex(/^cpn-/, 'Coupon ids must start with "cpn-".'),
  code: z.string().trim().min(3).max(30).toUpperCase(),
  description: z.string().max(500).default(""),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number().finite().min(0).max(1_000_000).default(0),
  minOrderValue: z.number().finite().min(0).max(9_999_999).optional(),
  maxDiscountCap: z.number().finite().min(0).max(9_999_999).optional(),
  usageLimit: z.number().int().min(0).optional(),
  perUserLimit: z.number().int().min(0).optional(),
  validFrom: z.string().datetime({ offset: true }).optional(),
  validUntil: z.string().datetime({ offset: true }).optional(),
  active: z.boolean().default(true),
  autoApply: z.boolean().optional(),
  appliesToOrders: z.boolean().optional(),
  appliesToDiwali: z.boolean().optional(),
  tiers: z
    .array(
      z.object({
        threshold: z.number().finite().min(1).max(9_999_999),
        amount: z.number().finite().min(1).max(TIERED_DISCOUNT_ABSOLUTE_CAP),
      }),
    )
    .max(10)
    .optional(),
});

export const couponPatchSchema = couponSchema.partial();

/** Public, display-only check for manually entered coupon codes. */
export const couponValidationSchema = z.object({
  codes: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  subtotal: z.number().finite().min(0).max(9_999_999),
});

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "inDiscussion", "converted", "closed"]),
});

export const orderStatusPatchSchema = z.object({
  status: z.enum(["received", "confirmed", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  notes: z.string().max(2000).optional(),
});

const cloudinaryImageAssetSchema = z.object({
  publicId: z.string().trim().min(1).max(500),
  secureUrl: z.string().trim().url().max(1000),
  resourceType: z.literal("image").default("image"),
  version: z.string().trim().max(80).optional(),
});

export const paymentAccountSchema = z.object({
  id: z.string().trim().min(4).max(80).regex(/^payacct-/, 'Payment account ids must start with "payacct-".'),
  label: z.string().trim().min(1).max(80),
  receiverName: z.string().trim().min(1).max(120),
  upiId: z.string().trim().toLowerCase().min(3).max(120).regex(/^[a-z0-9._-]+@[a-z0-9.-]+$/, "Enter a valid UPI ID."),
  qrAsset: cloudinaryImageAssetSchema,
  active: z.boolean().default(true),
  defaultAccount: z.boolean().default(false),
});

export const paymentAccountPatchSchema = paymentAccountSchema.partial().extend({
  id: z.string().optional(),
});

export const paymentSubmissionSchema = z.object({
  upiTransactionRef: z.string().trim().min(4).max(160),
  submissionRequestId: z.string().trim().min(8).max(160),
});

export const paymentReviewSchema = z.object({
  decision: z.enum(["approved", "rejected", "correction_requested"]),
  correctionReason: z.string().trim().max(1000).optional(),
}).refine(
  (value) => value.decision === "approved" || Boolean(value.correctionReason?.trim()),
  { message: "Correction reason is required when a payment is not approved." },
);

export const slotConfigPatchSchema = z.object({
  enabled: z.boolean().optional(),
  maxOrders: z.number().int().min(0).max(1000).optional(),
});

export const deliveryAreaPatchSchema = z.object({
  name: z.string().trim().min(1, "Area name is required.").max(80),
  pincode: z.string().trim().min(3).max(10),
  charge: z.number().finite().min(0).max(1_000_000),
  active: z.boolean().default(true),
});

export const blogUpsertSchema = z.object({
  id: z.string(), // internal: "blog-N" / "blg-slug"
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().max(320).default(""),
  content: z.string().max(100_000).default(""),
  sections: z
    .array(
      z.object({
        heading: z.string().max(200),
        body: z.string().max(30_000),
      }),
    )
    .max(40)
    .default([]),
  category: z.string().max(60).default("All Flowers"),
  tags: z.array(z.string().max(40)).max(20).default([]),
  coverImage: z.string().max(1000).default("gradient-ivory"),
  author: z.string().max(80).default("FreshFlower Team"),
  publishedAt: z.string().default(() => new Date().toISOString()),
  status: z.enum(["published", "draft"]).default("published"),
  seoTitle: z.string().max(160).default(""),
  metaDescription: z.string().max(320).default(""),
  keywords: z.array(z.string().max(60)).max(30).default([]),
});

export const offerBannerUpsertSchema = z.object({
  id: z.string().min(1).max(80),
  badge: z.string().max(60).default(""),
  title: z.string().max(160).default(""),
  copy: z.string().max(500).default(""),
  ctaLabel: z.string().max(40).default(""),
  ctaHref: z.string().max(500).default(""),
});

/** Must mirror `HomepageConfig` — the admin saves that exact object. */
export const homepageUpsertSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(80).default(""),
    titleLines: z.array(z.string().max(160)).max(6).default([]),
    accentLineIndex: z.number().int().min(0).max(6).default(0),
    subtitle: z.string().max(500).default(""),
    ctaPrimaryLabel: z.string().max(40).default(""),
    ctaPrimaryHref: z.string().max(500).default(""),
    ctaSecondaryLabel: z.string().max(40).default(""),
    ctaSecondaryHref: z.string().max(500).default(""),
  }),
  announcementText: z.string().max(180).default(""),
  featuredFlowerIds: z.array(z.string().max(120)).max(24).default([]),
  showsFreshToday: z.boolean().default(true),
  offers: z.array(offerBannerUpsertSchema).max(6).default([]),
  testimonialReviewIds: z.array(z.string().max(120)).max(12).default([]),
  festivalHeroEnabled: z.boolean().optional(),
  sections: z.array(homepageSectionSchema).max(HOMEPAGE_SECTION_IDS.length)
    .refine((sections) => new Set(sections.map((section) => section.id)).size === sections.length,
      "Homepage sections must be unique.").optional(),
  categoryIds: orderedIdsSchema.optional(),
  festivalCollectionIds: orderedIdsSchema.optional(),
  salesBoosters: z.object({
    festivalBadges: z.boolean().optional(),
    lowStockLabels: z.boolean().optional(),
    collectionCutoff: z.boolean().optional(),
    whatsappBulkOrder: z.boolean().optional(),
  }).optional(),
});

export const settingsUpsertSchema = z.object({
  storeName: z.string().max(120).default("FreshFlower"),
  tagline: z.string().max(300).default(""),
  phone: z.string().max(30).default(""),
  whatsapp: z.string().max(30).default(""),
  email: z.string().email().max(120),
  address: z.string().max(500).default(""),
  currency: z.string().max(12).default("INR"),
  orderEmailTemplate: z.string().max(10_000).default(""),
  social: z
    .object({
      instagram: z.string().url().max(500).or(z.literal("")).default(""),
      facebook: z.string().url().max(500).or(z.literal("")).default(""),
      twitter: z.string().url().max(500).or(z.literal("")).default(""),
    })
    .default({ instagram: "", facebook: "", twitter: "" }),
});

export const seoOverrideSchema = z.object({
  path: z.string().max(300).default("/"),
  title: z.string().max(160).default(""),
  description: z.string().max(320).default(""),
});

export const adminUserSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email().max(120),
  role: z
    .enum(["super_admin", "order_manager", "inventory_manager", "content_manager", "support_manager"])
    .default("super_admin"),
  active: z.boolean().default(true),
  password: z.string().min(6).max(200).optional(),
});

export const customerDetailSchema = z.object({
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(120).optional(),
  address: z
    .object({
      line: z.string().max(200),
      city: z.string().max(80),
      pincode: z.string().max(10),
    })
    .optional(),
});

const addressSchema = z.object({
  line: z.string().trim().min(3, "Address is required.").max(200),
  city: z.string().trim().min(2).max(80),
  areaId: z.string().trim().min(1, "Delivery area is required."),
  pincode: z.string().trim().default(""),
});

export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Full name is required.").max(120),
    phone: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
    email: z.string().email("Enter a valid email address."),
    address: addressSchema,
    notes: z.string().max(2000).default(""),
    preferCall: z.boolean().default(false),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productType: z.enum(["flower", "bouquet"]).default("flower"),
        name: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
        price: z.number().finite().min(0),
        color: z.string().max(80).optional(),
        image: z.string().max(1000).optional(),
      }),
    )
    .min(1, "Your cart is empty.")
    .max(99),
  deliverySlotId: z.string().min(1),
  deliveryDate: z.string(),
  coupons: z.array(z.string().max(40)).max(10).default([]),
  subtotal: z.number().finite().min(0),
  discount: z.number().finite().min(0),
  deliveryFee: z.number().finite().min(0),
  total: z.number().finite().min(0),
  paymentMethod: z.enum(["online", "cod", "upi"]).default("online").describe("placeholder for payment wiring"),
  paymentAccountId: z.string().trim().max(80).optional(),
  checkoutRequestId: z.string().trim().min(8).max(120).optional(),
  agreedToTos: z.boolean().refine((value) => value === true, {
    message: "Please accept the terms.",
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const contactEnquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  email: z.string().email(),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(5000),
});

export const wholesaleEnquirySchema = z.object({
  businessName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  email: z.string().email(),
  monthlyVolumeEstimate: z.string().trim().max(120).default(""),
  message: z.string().trim().max(5000).default(""),
});

export const weddingEnquirySchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number."),
  email: z.string().email(),
  eventDate: z.string(),
  venue: z.string().trim().min(2).max(300),
  guestCount: z.number().int().min(1).max(100_000).optional(),
  budgetRange: z.string().trim().min(1).max(120).default(""),
  message: z.string().trim().max(5000).default(""),
});
