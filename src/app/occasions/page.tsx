import type { Metadata } from "next";
import { OccasionDirectory } from "@/components/sections/DirectoryGrid";
import { getOccasions } from "@/lib/db/repositories";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Occasions & gifting | FreshFlower.zone",
  description:
    "Flowers for every occasion in Delhi NCR — birthdays, anniversaries, apologies, congratulations and more, delivered on time.",
  alternates: { canonical: canonical("/occasions") },
};

export const dynamic = "force-dynamic";

export default async function OccasionsPage() {
  const occasions = await getOccasions();
  return <OccasionDirectory occasions={occasions} />;
}
