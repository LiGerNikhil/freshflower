import { Schema, model, models, type Model } from "mongoose";
import { OrderStatus, AdminRole } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mongoose models — mirror src/lib/types/index.ts 1:1.
//
// Every collection uses the existing natural-string `id` (e.g. "fl-red-rose-bunch",
// "cat-roses", "ord-1001") as its `_id`. Relationships (categoryId, productId,
// deliveryAreaId …) are the same strings the TS interfaces use, so repository
// results can be returned with identical shapes and zero consumer changes.
// Timestamps (`createdAt`/`updatedAt`) are stored as Date and serialized to ISO.
// ---------------------------------------------------------------------------

const AddressSchema = new Schema(
  {
    id: String,
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    areaId: String,
    pincode: { type: String, default: "" },
    landmark: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

// ---- Catalog ----------------------------------------------------------------

const CategorySchema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  heroImage: String,
  imageUrl: String,
  sortOrder: { type: Number, default: 0 },
});

const OccasionSchema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
});

const FlowerSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true },
    occasionIds: { type: [String], default: [] },
    description: { type: String, default: "" },
    shortDescription: { type: String, default: "" },
    price: { type: Number, required: true },
    compareAtPrice: Number,
    stemCount: Number,
    colors: { type: [String], default: [] },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    inStock: { type: Boolean, default: true },
    availableToday: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    careInstructions: String,
    sku: String,
    quantity: Number,
    unit: String,
    stock: Number,
    stockStatus: String,
    active: { type: Boolean, default: true },
    bestSeller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    seoTitle: String,
    metaDescription: String,
    keywords: { type: [String], default: [] },
  },
  { timestamps: true },
);

FlowerSchema.index({ categoryId: 1 });
FlowerSchema.index({ featured: 1, active: 1 });
FlowerSchema.index({ availableToday: 1 });
FlowerSchema.index({ stockStatus: 1 });
FlowerSchema.index({ active: 1 });
FlowerSchema.index({ bestSeller: 1 });
FlowerSchema.index({ newArrival: 1 });

const BouquetItemSchema = new Schema(
  {
    _id: false,
    flowerId: { type: String, ref: "Flower" },
    quantity: { type: Number, default: 1 },
  },
  { _id: false },
);

const BouquetSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    items: { type: [BouquetItemSchema], default: [] },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    occasionIds: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ---- Orders -----------------------------------------------------------------

const OrderItemSchema = new Schema(
  {
    _id: false,
    productId: { type: String, required: true },
    productType: { type: String, enum: ["flower", "bouquet"], required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: String,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    _id: { type: String },
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Received,
    },
    deliveryAreaId: String,
    deliverySlotId: String,
    deliveryDate: Date,
    deliveryAddress: AddressSchema,
    couponCode: String,
    notes: String,
    paymentStatus: { type: String, enum: ["paid", "pending", "refunded"] },
    paymentMethod: { type: String, enum: ["online", "cod"] },
  },
  { timestamps: true },
);

OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ deliveryDate: 1 });
OrderSchema.index({ deliverySlotId: 1 });
OrderSchema.index({ "deliveryAddress.pincode": 1 });

// ---- Delivery ---------------------------------------------------------------

const DeliverySlotSchema = new Schema({
  _id: { type: String },
  label: { type: String, required: true },
  startTime: String,
  endTime: String,
  isMorningExpress: { type: Boolean, default: false },
  maxOrders: { type: Number, default: 3 },
  enabled: { type: Boolean, default: true },
});

DeliverySlotSchema.index({ enabled: 1 });

const DeliveryAreaSchema = new Schema({
  _id: { type: String },
  name: { type: String, required: true },
  pincode: { type: [String], default: [] },
  deliveryFee: { type: Number, default: 0 },
  estimatedMinutes: { type: Number, default: 45 },
  active: { type: Boolean, default: true },
});

DeliveryAreaSchema.index({ active: 1 });
DeliveryAreaSchema.index({ pincode: 1 });

// ---- Customers --------------------------------------------------------------

const CustomerSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    addresses: { type: [AddressSchema], default: [] },
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true },
);

CustomerSchema.index({ phone: 1 });

// ---- Content ----------------------------------------------------------------

const ReviewSchema = new Schema(
  {
    _id: { type: String },
    productId: { type: String, required: true },
    productType: { type: String, enum: ["flower", "bouquet"], required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    photoUrl: String,
    verifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "featured"],
      default: "pending",
    },
  },
  { timestamps: true },
);

ReviewSchema.index({ productId: 1, productType: 1 });
ReviewSchema.index({ status: 1 });

const BlogSectionSchema = new Schema(
  {
    _id: false,
    heading: String,
    paragraphs: { type: [String], default: [] },
    bullets: { type: [String], default: [] },
  },
  { _id: false },
);

const BlogPostSchema = new Schema(
  {
    _id: { type: String },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "" },
    category: { type: String, default: "" },
    publishedAt: { type: Date, required: true },
    tags: { type: [String], default: [] },
    sections: { type: [BlogSectionSchema], default: [] },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    seoTitle: String,
    metaDescription: String,
    keywords: { type: [String], default: [] },
  },
  { timestamps: true },
);

BlogPostSchema.index({ slug: 1 }, { unique: true });
BlogPostSchema.index({ status: 1, publishedAt: -1 });
BlogPostSchema.index({ category: 1 });

const CouponSchema = new Schema({
  _id: { type: String },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: "" },
  discountType: { type: String, enum: ["percentage", "flat"], required: true },
  discountValue: { type: Number, required: true },
  minOrderValue: Number,
  maxDiscountCap: Number,
  usageLimit: Number,
  perUserLimit: Number,
  validFrom: Date,
  validUntil: Date,
  active: { type: Boolean, default: true },
});

CouponSchema.index({ active: 1 });

// ---- Enquiries --------------------------------------------------------------

const EnquiryBase = {
  createdAt: { type: Date, default: () => new Date() },
  status: {
    type: String,
    enum: ["new", "contacted", "inDiscussion", "converted", "closed"],
    default: "new",
  },
};

const WholesaleEnquirySchema = new Schema({
  _id: { type: String },
  businessName: { type: String, default: "" },
  contactName: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  monthlyVolumeEstimate: { type: String, default: "" },
  message: { type: String, default: "" },
  ...EnquiryBase,
});

WholesaleEnquirySchema.index({ status: 1 });

const WeddingEnquirySchema = new Schema({
  _id: { type: String },
  clientName: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  eventDate: Date,
  venue: { type: String, default: "" },
  guestCount: Number,
  budgetRange: { type: String, default: "" },
  message: { type: String, default: "" },
  ...EnquiryBase,
});

WeddingEnquirySchema.index({ status: 1 });

const ContactEnquirySchema = new Schema({
  _id: { type: String },
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  subject: { type: String, default: "" },
  message: { type: String, default: "" },
  ...EnquiryBase,
});

ContactEnquirySchema.index({ status: 1 });

// ---- Admin ------------------------------------------------------------------

const AdminUserSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(AdminRole), required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ---- Phase 16 single-document configs ---------------------------------------

const OfferBannerSchema = new Schema(
  {
    _id: false,
    id: String,
    badge: String,
    title: String,
    copy: String,
    ctaLabel: String,
    ctaHref: String,
  },
  { _id: false },
);

const HomepageConfigSchema = new Schema(
  {
    _id: { type: String, default: "homepage" },
    hero: {
      eyebrow: String,
      titleLines: { type: [String], default: [] },
      accentLineIndex: { type: Number, default: 0 },
      subtitle: String,
      ctaPrimaryLabel: String,
      ctaPrimaryHref: String,
      ctaSecondaryLabel: String,
      ctaSecondaryHref: String,
    },
    featuredFlowerIds: { type: [String], default: [] },
    showsFreshToday: { type: Boolean, default: true },
    offers: { type: [OfferBannerSchema], default: [] },
    testimonialReviewIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

const BusinessSettingsSchema = new Schema(
  {
    _id: { type: String, default: "settings" },
    phoneNumber: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    email: { type: String, default: "" },
    addressLine: { type: String, default: "" },
    businessHours: {
      type: [{ label: String, value: String }],
      default: [],
    },
    porterNote: { type: String, default: "" },
    deliveryChargeNote: { type: String, default: "" },
    instagramHandle: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

const SeoRouteOverrideSchema = new Schema(
  {
    _id: { type: String }, // route path, e.g. "/flowers/[slug]"
    title: String,
    description: String,
    keywords: String,
  },
  { timestamps: true },
);

// Admin login credentials (dummy auth — production will replace with a real
// session provider). Keyed by lowercased email; the plaintext password is the
// same demo value used in the preview build.
const AdminCredentialSchema = new Schema(
  {
    _id: { type: String }, // email (lowercased)
    password: { type: String, required: true },
  },
  { timestamps: true },
);

// Guard against hot-reload re-registration.
const register = <T>(name: string, schema: Schema): Model<T> =>
  (models[name] as Model<T> | undefined) ?? model<T>(name, schema);

export const CategoryModel = register<any>("Category", CategorySchema);
export const OccasionModel = register<any>("Occasion", OccasionSchema);
export const FlowerModel = register<any>("Flower", FlowerSchema);
export const BouquetModel = register<any>("Bouquet", BouquetSchema);
export const OrderModel = register<any>("Order", OrderSchema);
export const DeliverySlotModel = register<any>("DeliverySlot", DeliverySlotSchema);
export const DeliveryAreaModel = register<any>("DeliveryArea", DeliveryAreaSchema);
export const CustomerModel = register<any>("Customer", CustomerSchema);
export const ReviewModel = register<any>("Review", ReviewSchema);
export const BlogPostModel = register<any>("BlogPost", BlogPostSchema);
export const CouponModel = register<any>("Coupon", CouponSchema);
export const WholesaleEnquiryModel = register<any>(
  "WholesaleEnquiry",
  WholesaleEnquirySchema,
);
export const WeddingEnquiryModel = register<any>("WeddingEnquiry", WeddingEnquirySchema);
export const ContactEnquiryModel = register<any>("ContactEnquiry", ContactEnquirySchema);
export const AdminUserModel = register<any>("AdminUser", AdminUserSchema);
export const AdminCredentialModel = register<any>(
  "AdminCredential",
  AdminCredentialSchema,
);
export const HomepageConfigModel = register<any>(
  "HomepageConfig",
  HomepageConfigSchema,
);
export const BusinessSettingsModel = register<any>(
  "BusinessSettings",
  BusinessSettingsSchema,
);
export const SeoRouteOverrideModel = register<any>(
  "SeoRouteOverride",
  SeoRouteOverrideSchema,
);
