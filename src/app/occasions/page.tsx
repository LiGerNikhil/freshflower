import type { Metadata } from "next";
import { OccasionDirectory } from "@/components/sections/DirectoryGrid";
import { occasions } from "@/lib/data";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Occasions & gifting | FreshFlower.zone",
  description:
    "Flowers for every occasion in Delhi NCR — birthdays, anniversaries, apologies, congratulations and more, delivered on time.",
  alternates: { canonical: canonical("/occasions") },
};

export default function OccasionsPage() {
  return <OccasionDirectory occasions={occasions} />;
}
