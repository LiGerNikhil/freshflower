import Image from "next/image";
import { Flower2 } from "lucide-react";
import { GRADIENT_TOKENS, isRemoteImage } from "@/lib/utils";

export function AdminThumb({
  token,
  name,
  className = "h-10 w-10",
}: {
  token?: string;
  name: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${name} — artwork`}
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md ${className}`}
      style={{
        background:
          token && token.startsWith("gradient-")
            ? (GRADIENT_TOKENS[token] ?? GRADIENT_TOKENS["gradient-ivory"])
            : GRADIENT_TOKENS["gradient-ivory"],
      }}
    >
      {isRemoteImage(token) ? (
        <Image
          src={token as string}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      ) : (
        <Flower2 size={18} strokeWidth={0.7} aria-hidden="true" className="text-ink/20" />
      )}
    </div>
  );
}