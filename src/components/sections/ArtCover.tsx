import { Flower2 } from "lucide-react";
import { GRADIENT_TOKENS } from "@/lib/utils";

export function ArtCover({
  token,
  name,
  size = 88,
  className = "",
}: {
  token: string;
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${name} — preview artwork`}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: GRADIENT_TOKENS[token] ?? GRADIENT_TOKENS["gradient-ivory"] }}
    >
      <Flower2
        size={size}
        strokeWidth={0.7}
        aria-hidden="true"
        className="text-ink/20 transition-transform duration-500"
      />
    </div>
  );
}