import Image from "next/image";
import { Package } from "lucide-react";
import { GRADIENT_TOKENS, cn, isRemoteImage } from "@/lib/utils";

export function ProductItemImage({
  image,
  name,
  className,
}: {
  image?: string;
  name: string;
  className?: string;
}) {
  const src = image ?? "gradient-ivory";
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-ivory-deep",
        className,
      )}
      style={{
        background: isRemoteImage(src)
          ? undefined
          : GRADIENT_TOKENS[src] ?? GRADIENT_TOKENS["gradient-ivory"],
      }}
    >
      {isRemoteImage(src) ? (
        <Image src={src} alt={name} fill sizes="112px" className="object-cover" />
      ) : (
        <Package size={24} className="text-ink/25" />
      )}
    </div>
  );
}
