import { dbConnect } from "@/lib/db/connect";
import {
  AdminUserModel,
  BlogPostModel,
  BouquetModel,
  BusinessSettingsModel,
  CategoryModel,
  ContactEnquiryModel,
  CouponModel,
  CustomerModel,
  DeliveryAreaModel,
  DeliverySlotModel,
  FlowerModel,
  HomepageConfigModel,
  OccasionModel,
  OrderModel,
  ReviewModel,
  SeoRouteOverrideModel,
  WeddingEnquiryModel,
  WholesaleEnquiryModel,
} from "@/lib/db/models";
import {
  DEFAULT_HOMEPAGE,
  DEFAULT_SETTINGS,
} from "@/lib/data";
import type {
  AdminUser,
  BlogPost,
  Bouquet,
  BusinessSettings,
  Category,
  ContactEnquiry,
  Coupon,
  Customer,
  DeliveryArea,
  DeliverySlot,
  Flower,
  HomepageConfig,
  Occasion,
  Order,
  Review,
  SeoRouteOverride,
  WeddingEnquiry,
  WholesaleEnquiry,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Serialization
// ---------------------------------------------------------------------------

type WithMeta = { _id?: unknown; __v?: number } & Record<string, unknown>;

export function serialize<T>(doc: WithMeta | null): T | null {
  if (!doc) return null;
  const { _id, __v, ...rest } = doc;
  const out: Record<string, unknown> = { ...rest, id: String(_id) };
  // Normalize every Date field back to an ISO string (createdAt/updatedAt,
  // deliveryDate, publishedAt, validFrom/validUntil, enquiry eventDate …).
  for (const [key, value] of Object.entries(rest)) {
    if (value instanceof Date) out[key] = value.toISOString();
  }
  if (typeof rest.createdAt === "number" || rest.createdAt instanceof Date) {
    out.createdAt = new Date(rest.createdAt as number | Date).toISOString();
  }
  if (typeof rest.updatedAt === "number" || rest.updatedAt instanceof Date) {
    out.updatedAt = new Date(rest.updatedAt as number | Date).toISOString();
  }
  return out as T;
}

export function serializeList<T>(docs: unknown[]): T[] {
  return docs
    .flatMap((d) => {
      const s = serialize<T>(d as WithMeta | null);
      return s ? [s] : [];
    });
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export async function getFlowers(): Promise<Flower[]> {
  await dbConnect();
  const docs = await FlowerModel.find().sort({ _id: 1 }).lean();
  return serializeList<Flower>(docs);
}

export async function getActiveFlowers(): Promise<Flower[]> {
  await dbConnect();
  const docs = await FlowerModel.find({ active: { $ne: false } })
    .sort({ _id: 1 })
    .lean();
  return serializeList<Flower>(docs);
}

export async function getFlowerBySlug(slug: string): Promise<Flower | null> {
  await dbConnect();
  const doc = await FlowerModel.findOne({ slug }).lean();
  return serialize<Flower>(doc as WithMeta | null);
}

export async function getFlowerById(id: string): Promise<Flower | null> {
  await dbConnect();
  const doc = await FlowerModel.findById(id).lean();
  return serialize<Flower>(doc as WithMeta | null);
}

export async function getCategories(): Promise<Category[]> {
  await dbConnect();
  const docs = await CategoryModel.find().sort({ sortOrder: 1, _id: 1 }).lean();
  return serializeList<Category>(docs);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await dbConnect();
  const doc = await CategoryModel.findOne({ slug }).lean();
  return serialize<Category>(doc as WithMeta | null);
}

export async function getOccasions(): Promise<Occasion[]> {
  await dbConnect();
  const docs = await OccasionModel.find().sort({ _id: 1 }).lean();
  return serializeList<Occasion>(docs);
}

export async function getOccasionBySlug(slug: string): Promise<Occasion | null> {
  await dbConnect();
  const doc = await OccasionModel.findOne({ slug }).lean();
  return serialize<Occasion>(doc as WithMeta | null);
}

export async function getBouquets(): Promise<Bouquet[]> {
  await dbConnect();
  const docs = await BouquetModel.find().sort({ _id: 1 }).lean();
  return serializeList<Bouquet>(docs);
}

export async function getBouquetBySlug(slug: string): Promise<Bouquet | null> {
  await dbConnect();
  const doc = await BouquetModel.findOne({ slug }).lean();
  return serialize<Bouquet>(doc as WithMeta | null);
}

export async function getBouquetById(id: string): Promise<Bouquet | null> {
  await dbConnect();
  const doc = await BouquetModel.findById(id).lean();
  return serialize<Bouquet>(doc as WithMeta | null);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function getOrders(): Promise<Order[]> {
  await dbConnect();
  const docs = await OrderModel.find().sort({ orderNumber: 1 }).lean();
  return serializeList<Order>(docs);
}

export async function getOrderById(id: string): Promise<Order | null> {
  await dbConnect();
  const doc = await OrderModel.findById(id).lean();
  return serialize<Order>(doc as WithMeta | null);
}

export async function getOrderByNumber(
  orderNumber: string,
): Promise<Order | null> {
  await dbConnect();
  const doc = await OrderModel.findOne({ orderNumber }).lean();
  return serialize<Order>(doc as WithMeta | null);
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  await dbConnect();
  const docs = await OrderModel.find({ customerId })
    .sort({ createdAt: -1 })
    .lean();
  return serializeList<Order>(docs);
}

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------

export async function getDeliverySlots(): Promise<DeliverySlot[]> {
  await dbConnect();
  const docs = await DeliverySlotModel.find().sort({ _id: 1 }).lean();
  return serializeList<DeliverySlot>(docs);
}

export async function getEnabledDeliverySlots(): Promise<DeliverySlot[]> {
  await dbConnect();
  const docs = await DeliverySlotModel.find({ enabled: { $ne: false } })
    .sort({ _id: 1 })
    .lean();
  return serializeList<DeliverySlot>(docs);
}

export async function getDeliverySlotById(id: string): Promise<DeliverySlot | null> {
  await dbConnect();
  const doc = await DeliverySlotModel.findById(id).lean();
  return serialize<DeliverySlot>(doc as WithMeta | null);
}

export async function getDeliveryAreas(): Promise<DeliveryArea[]> {
  await dbConnect();
  const docs = await DeliveryAreaModel.find().sort({ _id: 1 }).lean();
  return serializeList<DeliveryArea>(docs);
}

export async function getActiveDeliveryAreas(): Promise<DeliveryArea[]> {
  await dbConnect();
  const docs = await DeliveryAreaModel.find({ active: { $ne: false } })
    .sort({ _id: 1 })
    .lean();
  return serializeList<DeliveryArea>(docs);
}

export async function getDeliveryAreaByPincode(
  pincode: string,
): Promise<DeliveryArea | null> {
  await dbConnect();
  const doc = await DeliveryAreaModel.findOne({ pincode }).lean();
  return serialize<DeliveryArea>(doc as WithMeta | null);
}

/** Count of non-cancelled orders already booked into a slot on a date. */
export async function getSlotUsage(
  slotId: string,
  deliveryDate: string,
): Promise<number> {
  await dbConnect();
  const start = new Date(deliveryDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  const count = await OrderModel.countDocuments({
    deliverySlotId: slotId,
    deliveryDate: { $gte: start, $lte: end },
    status: { $ne: "cancelled" },
  });
  return count;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export async function getCustomers(): Promise<Customer[]> {
  await dbConnect();
  const docs = await CustomerModel.find().sort({ _id: 1 }).lean();
  return serializeList<Customer>(docs);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  await dbConnect();
  const doc = await CustomerModel.findById(id).lean();
  return serialize<Customer>(doc as WithMeta | null);
}

export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  await dbConnect();
  let doc = await CustomerModel.findOne({ phone }).lean();
  if (!doc) {
    const digits = phone.replace(/\D/g, "").slice(-10);
    if (/^\d{10}$/.test(digits)) {
      const [d1, d2] = [digits.slice(0, 5), digits.slice(5)];
      // Seed customers are stored as "+91 98100 11223" while checkout stores
      // raw 10-digit numbers. Match either, tolerating separators.
      doc = await CustomerModel.findOne({
        phone: { $regex: new RegExp(`^(\\+?91[ -]?)?${d1}\\s?${d2}$`) },
      }).lean();
    }
  }
  return serialize<Customer>(doc as WithMeta | null);
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  await dbConnect();
  const doc = await CustomerModel.findOne({ email }).lean();
  return serialize<Customer>(doc as WithMeta | null);
}

// ---------------------------------------------------------------------------
// Content
// ---------------------------------------------------------------------------

export async function getReviews(status?: Review["status"]): Promise<Review[]> {
  await dbConnect();
  const filter = status ? { status } : {};
  const docs = await ReviewModel.find(filter).sort({ createdAt: -1 }).lean();
  return serializeList<Review>(docs);
}

export async function getReviewById(id: string): Promise<Review | null> {
  await dbConnect();
  const doc = await ReviewModel.findById(id).lean();
  return serialize<Review>(doc as WithMeta | null);
}

export async function getBlogPosts(status?: BlogPost["status"]): Promise<BlogPost[]> {
  await dbConnect();
  const filter = status ? { status } : {};
  const docs = await BlogPostModel.find(filter)
    .sort({ publishedAt: -1 })
    .lean();
  return serializeList<BlogPost>(docs);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await dbConnect();
  const doc = await BlogPostModel.findOne({ slug }).lean();
  return serialize<BlogPost>(doc as WithMeta | null);
}

export async function getCoupons(): Promise<Coupon[]> {
  await dbConnect();
  const docs = await CouponModel.find().sort({ _id: 1 }).lean();
  return serializeList<Coupon>(docs);
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  await dbConnect();
  const doc = await CouponModel.findOne({ code: code.toUpperCase() }).lean();
  return serialize<Coupon>(doc as WithMeta | null);
}

// ---------------------------------------------------------------------------
// Enquiries
// ---------------------------------------------------------------------------

export async function getWholesaleEnquiries(): Promise<WholesaleEnquiry[]> {
  await dbConnect();
  const docs = await WholesaleEnquiryModel.find().sort({ createdAt: -1 }).lean();
  return serializeList<WholesaleEnquiry>(docs);
}

export async function getWeddingEnquiries(): Promise<WeddingEnquiry[]> {
  await dbConnect();
  const docs = await WeddingEnquiryModel.find().sort({ createdAt: -1 }).lean();
  return serializeList<WeddingEnquiry>(docs);
}

export async function getContactEnquiries(): Promise<ContactEnquiry[]> {
  await dbConnect();
  const docs = await ContactEnquiryModel.find().sort({ createdAt: -1 }).lean();
  return serializeList<ContactEnquiry>(docs);
}

export async function getEnquiries(): Promise<{
  wholesale: WholesaleEnquiry[];
  wedding: WeddingEnquiry[];
  contact: ContactEnquiry[];
}> {
  const [wholesale, wedding, contact] = await Promise.all([
    getWholesaleEnquiries(),
    getWeddingEnquiries(),
    getContactEnquiries(),
  ]);
  return { wholesale, wedding, contact };
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export async function getAdminUsers(): Promise<AdminUser[]> {
  await dbConnect();
  const docs = await AdminUserModel.find().sort({ _id: 1 }).lean();
  return serializeList<AdminUser>(docs);
}

export async function getAdminUserByEmail(
  email: string,
): Promise<AdminUser | null> {
  await dbConnect();
  const doc = await AdminUserModel.findOne({ email: email.toLowerCase() }).lean();
  return serialize<AdminUser>(doc as WithMeta | null);
}

// ---------------------------------------------------------------------------
// Phase 16 configs (single-document)
// ---------------------------------------------------------------------------

export async function getHomepageConfig(): Promise<HomepageConfig> {
  await dbConnect();
  const doc = await HomepageConfigModel.findById("homepage").lean();
  const homepage = serialize<HomepageConfig>(doc as WithMeta | null);
  return homepage ?? DEFAULT_HOMEPAGE;
}

export async function getBusinessSettings(): Promise<BusinessSettings> {
  await dbConnect();
  const doc = await BusinessSettingsModel.findById("settings").lean();
  const settings = serialize<BusinessSettings>(doc as WithMeta | null);
  return settings ?? DEFAULT_SETTINGS;
}

export async function getSeoOverrides(): Promise<Record<string, SeoRouteOverride>> {
  await dbConnect();
  const docs = await SeoRouteOverrideModel.find().lean();
  const out: Record<string, SeoRouteOverride> = {};
  for (const override of docs as (WithMeta & SeoRouteOverride)[]) {
    const path = String(override._id);
    const { title, description, keywords } = override;
    out[path] = { title, description, keywords };
  }
  return out;
}

export async function getSeoOverride(
  path: string,
): Promise<SeoRouteOverride | null> {
  await dbConnect();
  const doc = await SeoRouteOverrideModel.findById(path).lean();
  if (!doc) return null;
  const { title, description, keywords } = doc;
  return { title, description, keywords };
}