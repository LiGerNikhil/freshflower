import { CategoryModel, FlowerModel } from "@/lib/db/models";
import { ApiError } from "@/lib/api/helpers";
import type { Flower } from "@/lib/types";

export const isUploadedImage = (url: string) => /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url);

export async function validateProductWrite(existing: Partial<Flower> | null, patch: Record<string, unknown>) {
  if (patch.salePrice !== undefined) {
    patch.compareAtPrice = Number(patch.salePrice) > 0 ? Number(patch.salePrice) : null;
    delete patch.salePrice;
  }
  if (patch.occassionIds !== undefined && patch.occasionIds === undefined) patch.occasionIds = patch.occassionIds;
  delete patch.occassionIds;
  if (!existing) {
    patch.publicationStatus ??= "draft";
    patch.active ??= false;
  }
  if (patch.publicationStatus === "draft") patch.active = false;
  const merged = { ...existing, ...patch } as Partial<Flower>;
  if (merged.active && merged.publicationStatus === "draft") {
    throw new ApiError("Publish this draft from the product editor before activating it.");
  }
  const publishing = merged.publicationStatus === "published" &&
    (!existing || existing.publicationStatus === "draft" || (patch.active === true && existing.active === false));
  if (publishing && !merged.images?.some(isUploadedImage)) {
    throw new ApiError("Upload a Cloudinary product image before publishing.");
  }
  if (!merged.categoryId || !(await CategoryModel.exists({ _id: merged.categoryId }))) {
    throw new ApiError("Choose an existing category.");
  }
  if (patch.slug && await FlowerModel.exists({ slug: patch.slug, ...(existing?.id ? { _id: { $ne: existing.id } } : {}) })) {
    throw new ApiError("This product slug is already in use.", 409);
  }
  if (patch.stock !== undefined || patch.stockStatus !== undefined) {
    const stock = Number(merged.stock ?? 0);
    const status = stock === 0 ? "sold-out" : merged.stockStatus === "pre-order" ? "pre-order" : stock < 15 ? "limited" : "in-stock";
    patch.stockStatus = status;
    patch.inStock = stock > 0;
    patch.availableToday = stock > 0 && status !== "pre-order";
  }
  return patch;
}
