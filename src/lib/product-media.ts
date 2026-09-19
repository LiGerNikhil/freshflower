type CatalogImageSource = {
  id: string;
  slug?: string;
  name: string;
  images?: string[];
};

type ItemImageInput = {
  productId?: string;
  name?: string;
  image?: string;
};

export function resolveProductImage(
  item: ItemImageInput,
  catalog: CatalogImageSource[],
): string {
  if (item.image) return item.image;
  const productId = item.productId ?? "";
  const normalizedName = item.name?.trim().toLowerCase();
  const match = catalog.find((product) => {
    const productSlugId = product.slug ? `fl-${product.slug}` : "";
    return (
      product.id === productId ||
      product.slug === productId ||
      productSlugId === productId ||
      (normalizedName && product.name.trim().toLowerCase() === normalizedName)
    );
  });
  return match?.images?.[0] ?? "gradient-ivory";
}
