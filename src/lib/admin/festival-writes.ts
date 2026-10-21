import { CategoryModel, FlowerModel } from "@/lib/db/models";
import { ApiError } from "@/lib/api/helpers";

export async function validateCollectionReferences(value: {
  productIds: string[]; categoryIds: string[]; status: string;
}) {
  const [products, categories] = await Promise.all([
    FlowerModel.countDocuments({ _id: { $in: value.productIds } }),
    CategoryModel.countDocuments({ _id: { $in: value.categoryIds } }),
  ]);
  if (products !== value.productIds.length || categories !== value.categoryIds.length) {
    throw new ApiError("A selected product or category no longer exists. Refresh and update the selection.");
  }
  if (value.status === "published") {
    const activeCategories = await CategoryModel.find({ _id: { $in: value.categoryIds }, active: { $ne: false } }).distinct("_id");
    const visible = await FlowerModel.exists({
      active: { $ne: false }, publicationStatus: { $ne: "draft" },
      $or: [{ _id: { $in: value.productIds } }, { categoryId: { $in: activeCategories } }],
    });
    if (!visible) throw new ApiError("Select at least one published product (directly or through an active category).");
  }
}
