import FlowersCatalogue from "@/components/sections/FlowersCatalogue";
import { type CatalogState } from "@/lib/catalog";
import type { Flower } from "@/lib/types";

export function FilteredFlowerCollection({
  flowers,
  initialState,
}: {
  flowers: Flower[];
  initialState: CatalogState;
}) {
  return <FlowersCatalogue flowers={flowers} initialState={initialState} />;
}
