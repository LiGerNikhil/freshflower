// PHASE 2 INTEGRATION — not active in preview.
// Mirrors /lib/types/index.ts. No model here is imported by /lib/data or any
// page/component yet — this file exists so Phase 2 can wire up real queries
// without re-deriving the schema shape from scratch.

import { Schema, model, models, type Model } from "mongoose";
import { OrderStatus, AdminRole } from "@/lib/types";

const AddressSchema = new Schema(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    areaId: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  heroImage: String,
  imageUrl: String,
});

const OccasionSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
});

const FlowerSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    occasionIds: [{ type: Schema.Types.ObjectId, ref: "Occasion" }],
    description: String,
    shortDescription: String,
    price: { type: Number, required: true },
    compareAtPrice: Number,
    stemCount: Number,
    colors: [String],
    images: [String],
    inStock: { type: Boolean, default: true },
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
    keywords: [String],
  },
  { timestamps: true }
);

const BouquetSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    items: [{ flowerId: { type: Schema.Types.ObjectId, ref: "Flower" }, quantity: Number }],
    price: { type: Number, required: true },
    images: [String],
    occasionIds: [{ type: Schema.Types.ObjectId, ref: "Occasion" }],
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: [
      {
        productId: Schema.Types.ObjectId,
        productType: { type: String, enum: ["flower", "bouquet"] },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    subtotal: Number,
    deliveryFee: Number,
    discount: Number,
    total: Number,
    status: { type: String, enum: Object.values(OrderStatus), default: OrderStatus.Received },
    deliveryAreaId: { type: Schema.Types.ObjectId, ref: "DeliveryArea" },
    deliverySlotId: { type: Schema.Types.ObjectId, ref: "DeliverySlot" },
    deliveryDate: Date,
    deliveryAddress: AddressSchema,
    couponCode: String,
    notes: String,
    paymentStatus: { type: String, enum: ["paid", "pending", "refunded"] },
    paymentMethod: { type: String, enum: ["online", "cod"] },
  },
  { timestamps: true }
);

const DeliverySlotSchema = new Schema({
  label: { type: String, required: true },
  startTime: String,
  endTime: String,
  isMorningExpress: Boolean,
  maxOrders: { type: Number, default: 3 },
  enabled: { type: Boolean, default: true },
});

const DeliveryAreaSchema = new Schema({
  name: { type: String, required: true },
  pincode: [String],
  deliveryFee: Number,
  estimatedMinutes: Number,
  active: { type: Boolean, default: true },
});

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    addresses: [AddressSchema],
    totalOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ReviewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    productType: { type: String, enum: ["flower", "bouquet"] },
    customerName: String,
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const BlogSectionSchema = new Schema(
  {
    heading: String,
    paragraphs: [String],
    bullets: [String],
  },
  { _id: false }
);

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: String,
    content: String,
    coverImage: String,
    author: String,
    category: String,
    publishedAt: Date,
    tags: [String],
    sections: [BlogSectionSchema],
  },
  { timestamps: true }
);

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountType: { type: String, enum: ["percentage", "flat"] },
  discountValue: Number,
  minOrderValue: Number,
  validFrom: Date,
  validUntil: Date,
  active: { type: Boolean, default: true },
});

const WholesaleEnquirySchema = new Schema(
  {
    businessName: String,
    contactName: String,
    phone: String,
    email: String,
    monthlyVolumeEstimate: String,
    message: String,
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);

const WeddingEnquirySchema = new Schema(
  {
    clientName: String,
    phone: String,
    email: String,
    eventDate: Date,
    venue: String,
    guestCount: Number,
    budgetRange: String,
    message: String,
    status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
  },
  { timestamps: true }
);

const ContactEnquirySchema = new Schema(
  {
    name: String,
    phone: String,
    email: String,
    subject: String,
    message: String,
    status: { type: String, enum: ["new", "responded", "closed"], default: "new" },
  },
  { timestamps: true }
);

const AdminUserSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: Object.values(AdminRole), required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// `models.X ?? model(...)` guards against Next.js hot-reload re-registering
// schemas. None of these are called yet — see PHASE 2 note above.
export const CategoryModel: Model<any> = models.Category ?? model("Category", CategorySchema);
export const OccasionModel: Model<any> = models.Occasion ?? model("Occasion", OccasionSchema);
export const FlowerModel: Model<any> = models.Flower ?? model("Flower", FlowerSchema);
export const BouquetModel: Model<any> = models.Bouquet ?? model("Bouquet", BouquetSchema);
export const OrderModel: Model<any> = models.Order ?? model("Order", OrderSchema);
export const DeliverySlotModel: Model<any> = models.DeliverySlot ?? model("DeliverySlot", DeliverySlotSchema);
export const DeliveryAreaModel: Model<any> = models.DeliveryArea ?? model("DeliveryArea", DeliveryAreaSchema);
export const CustomerModel: Model<any> = models.Customer ?? model("Customer", CustomerSchema);
export const ReviewModel: Model<any> = models.Review ?? model("Review", ReviewSchema);
export const BlogPostModel: Model<any> = models.BlogPost ?? model("BlogPost", BlogPostSchema);
export const CouponModel: Model<any> = models.Coupon ?? model("Coupon", CouponSchema);
export const WholesaleEnquiryModel: Model<any> =
  models.WholesaleEnquiry ?? model("WholesaleEnquiry", WholesaleEnquirySchema);
export const WeddingEnquiryModel: Model<any> =
  models.WeddingEnquiry ?? model("WeddingEnquiry", WeddingEnquirySchema);
export const ContactEnquiryModel: Model<any> =
  models.ContactEnquiry ?? model("ContactEnquiry", ContactEnquirySchema);
export const AdminUserModel: Model<any> = models.AdminUser ?? model("AdminUser", AdminUserSchema);
