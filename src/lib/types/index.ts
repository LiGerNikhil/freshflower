/**
 * FreshFlower.zone — core domain types.
 * These interfaces are the contract between /lib/data (dummy, Phase 0) and
 * /lib/db (Mongoose, Phase 2). Keep them in sync when the real schema lands.
 */

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImage: string; // path or gradient token for preview
  imageUrl?: string; // real photography when available
}

export interface Occasion {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/** Storefront availability of a flower, managed from the admin catalog. */
export type FlowerStockStatus =
  | "in-stock"
  | "limited"
  | "sold-out"
  | "pre-order";

export interface Flower {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  occasionIds: string[];
  description: string;
  shortDescription: string;
  price: number; // INR
  compareAtPrice?: number; // INR, for showing a discount (admin: "sale price")
  stemCount?: number;
  colors: string[];
  images: string[];
  inStock: boolean;
  availableToday: boolean;
  featured: boolean;
  rating: number; // 0-5, aggregated
  reviewCount: number;
  careInstructions?: string;
  // ---- Admin catalogue fields (Phase 13; optional until a product is edited) ----
  sku?: string;
  quantity?: number; // units per product (e.g. stems in a bunch)
  unit?: string; // e.g. "Stems", "Bunch", "String", "Plant"
  stock?: number; // current inventory count
  stockStatus?: FlowerStockStatus;
  active?: boolean; // false = hidden from the storefront ("disabled")
  bestSeller?: boolean;
  newArrival?: boolean;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface BouquetItem {
  flowerId: string;
  quantity: number;
}

export interface Bouquet {
  id: string;
  name: string;
  slug: string;
  description: string;
  items: BouquetItem[];
  price: number; // INR
  images: string[];
  occasionIds: string[];
  featured: boolean;
}

// ---------------------------------------------------------------------------
// Cart & orders
// ---------------------------------------------------------------------------

export interface CartItem {
  productId: string; // Flower.id or Bouquet.id
  productType: "flower" | "bouquet";
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export enum OrderStatus {
  Received = "received",
  Confirmed = "confirmed",
  Preparing = "preparing",
  Ready = "ready",
  OutForDelivery = "out_for_delivery",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export type PaymentStatus = "paid" | "pending" | "refunded";
export type PaymentMethod = "online" | "cod";

export interface OrderItem {
  productId: string;
  productType: "flower" | "bouquet";
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryAreaId: string;
  deliverySlotId: string;
  deliveryDate: string; // ISO date
  deliveryAddress: Address;
  couponCode?: string;
  notes?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

export interface DeliverySlot {
  id: string;
  label: string; // e.g. "6:00 AM – 7:00 AM"
  startTime: string; // "06:00"
  endTime: string; // "07:00"
  isMorningExpress: boolean;
}

export interface DeliveryArea {
  id: string;
  name: string; // e.g. "South Extension"
  pincode: string[];
  deliveryFee: number; // INR
  estimatedMinutes: number;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export interface Address {
  id: string;
  label: string; // "Home", "Office"
  line1: string;
  line2?: string;
  city: string;
  areaId: string;
  pincode: string;
  landmark?: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  createdAt: string;
  totalOrders: number;
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export type ReviewStatus = "pending" | "approved" | "rejected" | "featured";

export interface Review {
  id: string;
  productId: string;
  productType: "flower" | "bouquet";
  customerName: string;
  rating: number; // 1-5
  comment: string;
  photoUrl?: string; // gradient token or image path, optional
  createdAt: string;
  verifiedPurchase: boolean;
  status?: ReviewStatus;
}

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export type BlogPostStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // lead paragraph / intro
  coverImage: string;
  author: string;
  category: string;
  publishedAt: string;
  tags: string[];
  sections: BlogSection[];
  // ---- Admin CMS fields (Phase 16; optional until a post is edited) ----
  status?: BlogPostStatus;
  seoTitle?: string;
  metaDescription?: string;
  keywords?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  minOrderValue?: number;
  maxDiscountCap?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Enquiries (contact-style forms, not full orders)
// ---------------------------------------------------------------------------

export type EnquiryStatus = "new" | "contacted" | "inDiscussion" | "converted" | "closed";

export interface WholesaleEnquiry {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  monthlyVolumeEstimate: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
}

export interface WeddingEnquiry {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  eventDate: string;
  venue: string;
  guestCount?: number;
  budgetRange?: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: EnquiryStatus;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export enum AdminRole {
  SuperAdmin = "super_admin",
  OrderManager = "order_manager",
  InventoryManager = "inventory_manager",
  ContentManager = "content_manager",
  SupportManager = "support_manager",
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Phase 16 — CMS / marketing / settings
// ---------------------------------------------------------------------------

/** A configurable homepage offer / highlight banner (admin → live homepage). */
export interface OfferBanner {
  id: string;
  badge: string;
  title: string;
  copy?: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Editable homepage hero copy. */
export interface HomepageHeroConfig {
  eyebrow: string;
  titleLines: string[];
  accentLineIndex: number; // line rendered in the gold italic
  subtitle: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

/** The parts of the homepage the admin can control (single source of truth). */
export interface HomepageConfig {
  hero: HomepageHeroConfig;
  featuredFlowerIds: string[];
  showsFreshToday: boolean;
  offers: OfferBanner[];
  testimonialReviewIds: string[];
}

/** Business-level contact + delivery settings (single source of truth). */
export interface BusinessSettings {
  phoneNumber: string; // display + tel: (+91 85069 51873)
  whatsappNumber: string; // wa.me target
  email: string;
  addressLine: string;
  businessHours: { label: string; value: string }[];
  porterNote: string; // delivery/Porter note shown in cart/checkout
  deliveryChargeNote: string;
  instagramHandle: string;
  instagramUrl: string; // full Instagram profile URL (follow link)
}

/** Per-route title/description/keywords override applied client-side. */
export interface SeoRouteOverride {
  title?: string;
  description?: string;
  keywords?: string;
}
