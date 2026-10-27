import { NextRequest } from "next/server";
import { DeliveryAreaModel, FestivalCollectionModel, FlowerModel } from "@/lib/db/models";
import { getActiveDeliveryAreas, getCategories, getFlowers, serialize } from "@/lib/db/repositories";
import { ApiError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { requireAdminRole, CONTENT_WRITE_ROLES } from "@/lib/admin/authorization";
import { validateCollectionReferences } from "@/lib/admin/festival-writes";
import { festivalCollectionUpsertSchema } from "@/lib/validation";
import type { FestivalCollection, Flower } from "@/lib/types";

const CAMPAIGN_ID = "festival-diwali";

export async function GET(request: NextRequest) {
  return safe(async () => {
    await requireAdminRole(request, CONTENT_WRITE_ROLES);
    const [doc, flowers, categories, areas] = await Promise.all([
      FestivalCollectionModel.findById(CAMPAIGN_ID).lean(),
      getFlowers(),
      getCategories(),
      getActiveDeliveryAreas(),
    ]);
    const campaign = serialize<FestivalCollection>(doc);
    const flowerDocs = await FlowerModel.find({ _id: { $in: flowers.map((flower) => flower.id) } })
      .select({ _id: 1, sku: 1 })
      .lean();
    const skuById = new Map(flowerDocs.map((flower) => [String(flower._id), flower.sku]));
    return jsonOk({
      campaign,
      products: flowers.map((flower) => ({ ...flower, sku: skuById.get(flower.id) })),
      categories,
      areas,
    });
  });
}

export async function PUT(request: NextRequest) {
  return safe(async () => {
    await requireAdminRole(request, CONTENT_WRITE_ROLES);
    const campaign = parseOrThrow(festivalCollectionUpsertSchema, await readJson(request));
    if (campaign.slug !== "diwali") {
      throw new ApiError('The Diwali campaign slug must remain "diwali".');
    }
    const advanceBooking = campaign.advanceBooking;
    if (!advanceBooking) {
      throw new ApiError("Configure the Diwali advance-booking settings before saving.");
    }
    const productIds = new Set(campaign.productIds);
    if (advanceBooking.productSettings.some((setting) => !productIds.has(setting.productId))) {
      throw new ApiError("Campaign settings can only reference selected products.");
    }
    await validateCollectionReferences(campaign);
    const areaQuery = advanceBooking.deliveryAreaIds.length
      ? { _id: { $in: advanceBooking.deliveryAreaIds }, active: { $ne: false } }
      : { active: { $ne: false } };
    const [activeAreaIds, products] = await Promise.all([
      DeliveryAreaModel.find(areaQuery).distinct("_id"),
      FlowerModel.find({ _id: { $in: campaign.productIds }, active: { $ne: false }, publicationStatus: { $ne: "draft" } })
        .select({ _id: 1, colorVariants: 1 })
        .lean(),
    ]);
    if (advanceBooking.deliveryAreaIds.length && activeAreaIds.length !== advanceBooking.deliveryAreaIds.length) {
      throw new ApiError("One or more selected delivery areas are no longer active.");
    }
    if (campaign.status === "published") {
      if (!campaign.productIds.length) {
        throw new ApiError("Select at least one catalog product before publishing the Diwali campaign.");
      }
      if (!advanceBooking.deliveryDates.length || !advanceBooking.deliveryTimePreferences.length) {
        throw new ApiError("Add at least one delivery date and time preference before publishing.");
      }
      if (!activeAreaIds.length) {
        throw new ApiError("Configure at least one active delivery area before publishing the Diwali campaign.");
      }
      if (products.length !== campaign.productIds.length) {
        throw new ApiError("Published campaigns may only include active, published catalog products.");
      }
      const visibleProductIds = new Set(advanceBooking.productSettings
        .filter((setting) => setting.visible)
        .map((setting) => setting.productId));
      const hasVisibleProduct = campaign.productIds.some((productId) =>
        !advanceBooking.productSettings.some((setting) => setting.productId === productId)
          || visibleProductIds.has(productId),
      );
      if (!hasVisibleProduct) {
        throw new ApiError("Make at least one selected product visible for booking before publishing.");
      }
      const visibleProductHasInvalidVariants = campaign.productIds.some((productId) => {
        const setting = advanceBooking.productSettings.find((item) => item.productId === productId);
        if (setting?.visible === false) return false;
        const product = products.find((item) => String(item._id) === productId);
        return Boolean(product?.colorVariants?.length && setting && !setting.eligibleVariants.length);
      });
      if (visibleProductHasInvalidVariants) {
        throw new ApiError("Each visible product with variants must have at least one eligible variant.");
      }
    }
    const variantsByProduct = new Map(products.map((product) => [
      String(product._id),
      new Set((product.colorVariants ?? []).map((variant: { color: string }) => variant.color)),
    ]));
    for (const setting of advanceBooking.productSettings) {
      const variants = variantsByProduct.get(setting.productId);
      if (variants && setting.eligibleVariants.some((variant) => !variants.has(variant))) {
        throw new ApiError("A selected product variant no longer exists. Refresh the campaign settings.");
      }
    }

    const doc = await FestivalCollectionModel.findOneAndUpdate(
      { _id: CAMPAIGN_ID },
      { $set: campaign },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return jsonOk({ ok: true, campaign: serialize<FestivalCollection>(doc) });
  });
}
