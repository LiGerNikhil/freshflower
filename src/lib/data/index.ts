/**
 * Single import surface for the dummy data layer.
 * PHASE 2 INTEGRATION: when swapping to live MongoDB/Mongoose queries, only
 * the files in this folder should change — components/pages import from
 * "@/lib/data" and should never need to change their call sites.
 */
export * from "./categories";
export * from "./occasions";
export * from "./flowers";
export * from "./bouquets";
export * from "./orders";
export * from "./customers";
export * from "./reviews";
export * from "./blogs";
export * from "./coupons";
export * from "./deliveryAreas";
export * from "./deliverySlots";
export * from "./faqs";
export * from "./seoPages";
export * from "./enquiries";
export * from "./admin";
