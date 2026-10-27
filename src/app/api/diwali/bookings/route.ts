import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { DiwaliBookingModel, DeliveryAreaModel, FestivalCollectionModel, FlowerModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { ApiError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { diwaliBookingUpsertSchema } from "@/lib/validation";
import { DIWALI_PORTER_DELIVERY_FEE, isFestivalCollectionLive } from "@/lib/festivals";
import { getCustomerSession } from "@/lib/auth/customer-session";
import type { FestivalCollection } from "@/lib/types";

function todayInIndia(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export async function POST(request: NextRequest) {
  return safe(async () => {
    const session = await getCustomerSession(request);
    if (!session) {
      throw new ApiError("Please sign in to place a Diwali advance booking.", 401);
    }
    const input = parseOrThrow(diwaliBookingUpsertSchema, await readJson(request));
    await dbConnect();
    const rawCampaign = await FestivalCollectionModel.findById("festival-diwali").lean();
    const campaign = rawCampaign as (FestivalCollection & { _id: string }) | null;
    if (!campaign || !isFestivalCollectionLive(campaign)) {
      throw new ApiError("Diwali advance bookings are currently closed.", 409);
    }
    const settings = campaign.advanceBooking;
    if (!settings || (settings.bookingCutoffAt && new Date(settings.bookingCutoffAt).getTime() <= Date.now())) {
      throw new ApiError("Diwali advance bookings are currently closed.", 409);
    }
    if (!settings.customRequirementsEnabled && input.customRequirements?.trim()) {
      throw new ApiError("Custom and bulk requirements are not currently enabled for this campaign.", 400);
    }
    if (!settings.deliveryDates.includes(input.deliveryDate) || input.deliveryDate < todayInIndia()) {
      throw new ApiError("That delivery date is no longer available. Please choose another date.", 409);
    }
    if (!settings.deliveryTimePreferences.includes(input.deliveryTimePreference)) {
      throw new ApiError("That delivery window is no longer available. Please choose another window.", 409);
    }
    if (settings.dailyBookingLimit && await DiwaliBookingModel.countDocuments({
      campaignId: "festival-diwali",
      deliveryDate: input.deliveryDate,
      status: { $nin: ["cancelled", "rejected"] },
    }) >= settings.dailyBookingLimit) {
      throw new ApiError("That delivery date has reached its booking request limit. Please choose another date.", 409);
    }
    if (settings.deliveryAreaIds.length && !settings.deliveryAreaIds.includes(input.deliveryAreaId)) {
      throw new ApiError("The selected delivery area is not eligible for this campaign.", 409);
    }
    const area = await DeliveryAreaModel.findOne({
      _id: input.deliveryAreaId,
      active: { $ne: false },
    }).lean();
    if (!area) {
      throw new ApiError("Please select a valid delivery area.", 400);
    }
    const areaPincodes = Array.isArray(area.pincode) ? area.pincode : [];
    if (areaPincodes.length > 0 && !areaPincodes.includes(input.pincode)) {
      throw new ApiError("We do not currently deliver to that PIN code.", 400);
    }

    const campaignProducts = new Set(campaign.productIds);
    const productSettings = new Map((settings.productSettings ?? []).map((setting) => [setting.productId, setting]));
    const savedItems = [];
    let itemsSubtotal = 0;
    let needsQuote = Boolean(input.customRequirements?.trim());
    for (const requested of input.items) {
      if (!campaignProducts.has(requested.productId)) {
        throw new ApiError("A selected product is no longer part of this campaign.", 409);
      }
      const productSetting = productSettings.get(requested.productId);
      if (productSetting?.visible === false) {
        throw new ApiError("A selected product is no longer available for booking.", 409);
      }
      if (requested.quantity < (productSetting?.minQuantity ?? 1) || requested.quantity > (productSetting?.maxQuantity ?? 99)) {
        throw new ApiError("A selected quantity is outside the allowed range.", 400);
      }
      if (requested.quantity > 1 && productSetting?.bulkOrderEligible) needsQuote = true;

      const product = await FlowerModel.findOne({
        _id: requested.productId,
        active: { $ne: false },
        publicationStatus: { $ne: "draft" },
        inStock: { $ne: false },
        stockStatus: { $ne: "sold-out" },
      }).lean();
      if (!product) throw new ApiError("A selected product is currently unavailable.", 409);

      const variants = Array.isArray(product.colorVariants) ? product.colorVariants : [];
      let selectedVariant: { color: string; price?: number; image?: string } | undefined;
      if (variants.length) {
        const allowed = productSetting
          ? productSetting.eligibleVariants
          : variants.map((variant: { color: string }) => variant.color);
        if (!requested.variant || !allowed.includes(requested.variant)) {
          throw new ApiError(`Choose an available variant for ${product.name}.`, 400);
        }
        selectedVariant = variants.find((variant: { color: string }) => variant.color === requested.variant);
        if (!selectedVariant) throw new ApiError(`The selected variant for ${product.name} is unavailable.`, 409);
      } else if (requested.variant) {
        throw new ApiError(`${product.name} does not have selectable variants.`, 400);
      }
      const price = typeof selectedVariant?.price === "number" ? selectedVariant.price : product.price;
      const quantityLabel = product.unitLabel
        || (product.quantity ? `${product.quantity} ${product.unit ?? "units"}` : product.unit || "Unit");
      itemsSubtotal += price * requested.quantity;
      savedItems.push({
        productId: String(product._id),
        name: productSetting?.displayLabel?.trim() || product.name,
        variant: selectedVariant?.color,
        quantity: requested.quantity,
        unitLabel: quantityLabel,
        price,
        image: selectedVariant?.image || product.images?.[0],
      });
    }
    const deliveryFee = DIWALI_PORTER_DELIVERY_FEE;
    const estimatedAmount = itemsSubtotal + deliveryFee;
    const reference = `DIW-${Date.now().toString(36).toUpperCase()}-${crypto.randomInt(1000, 9999)}`;
    const booking = await DiwaliBookingModel.create({
      _id: `diwali-${crypto.randomUUID()}`,
      reference,
      campaignId: String(campaign._id),
      customerId: session.customerId,
      customer: input.customer,
      items: savedItems,
      deliveryDate: input.deliveryDate,
      deliveryTimePreference: input.deliveryTimePreference,
      deliveryAreaId: input.deliveryAreaId,
      address: input.address,
      locality: input.locality,
      pincode: input.pincode,
      specialInstructions: input.specialInstructions,
      customRequirements: input.customRequirements,
      itemsSubtotal,
      deliveryFee,
      estimatedAmount,
      needsQuote,
      status: "awaiting_payment",
      paymentStatus: "pending",
      paymentAmount: estimatedAmount,
    });
    return jsonOk({
      ok: true,
      reference,
      status: "awaiting_payment",
      itemsSubtotal,
      deliveryFee,
      estimatedAmount,
      needsQuote,
      booking: { id: String(booking._id) },
    }, 201);
  });
}
