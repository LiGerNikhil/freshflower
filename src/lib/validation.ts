import { z } from "zod";

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
  images: z.array(z.string().max(1000)).max(24).default(["gradient-ivory"]),
  videos: z.array(z.string().max(1000)).max(12).default([]),
  seoTitle: z.string().max(160).default(""),
  metaDescription: z.string().max(320).default(""),
  keywords: z.array(z.string().max(60)).max(30).default([]),
  active: z.boolean().default(true),
  occassionIds: z.array(z.string()).max(24).optional(),
});

export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;

/** Looser patch form used by quick admin edits (stock/status/active toggles). */
export const productPatchSchema = productUpsertSchema.partial();

export const categoryPatchSchema = z.object({
  name: z.string().trim().min(1, "Category name is required.").max(80),
  description: z.string().max(1000).default(""),
  heroImage: z.string().max(1000).optional(),
  sortOrder: z.number().int().optional(),
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
});

export const couponPatchSchema = couponSchema.partial();

export const reviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "inDiscussion", "converted", "closed"]),
});

export const orderStatusPatchSchema = z.object({
  status: z.enum(["pending", "confirmed", "packing", "out-for-delivery", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  notes: z.string().max(2000).optional(),
});

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

export const homepageUpsertSchema = z.object({
  hero: z.object({
    eyebrow: z.string().max(80).default(""),
    title: z.string().max(160).default(""),
    subtitle: z.string().max(500).default(""),
    ctaLabel: z.string().max(40).default(""),
    ctaLink: z.string().max(500).default(""),
    image: z.string().max(1000).default("gradient-ivory"),
    tint: z.number().min(0).max(100).default(0),
  }),
  stats: z.array(
    z.object({
      value: z.string().max(40),
      label: z.string().max(80),
    }),
  ).max(8).default([]),
  featuredCategoryIds: z.array(z.string()).max(12).default([]),
  themeImage: z.string().max(1000).default("gradient-sage"),
  promoCard: z.object({
    title: z.string().max(120).default(""),
    description: z.string().max(500).default(""),
    ctaLabel: z.string().max(40).default(""),
    ctaLink: z.string().max(500).default(""),
    badge: z.string().max(40).default(""),
  }),
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
    .default({}),
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
  paymentMethod: z.enum(["online", "cod"]).default("online").describe("placeholder for payment wiring"),
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
