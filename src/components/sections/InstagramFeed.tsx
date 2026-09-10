"use client";

import Image from "next/image";
import { Camera as Instagram, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/components/providers/SiteContentProvider";

const FEED_POSTS = [
  "https://content.jdmagicbox.com/comp/srinagar/d7/9999px194.x194.190617094002.n2d7/catalogue/flower-gallery-srinagar-0kfk0kiokt.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQndDdXFvkhtyUjrTmPaskzwfxmcBToh4R7EIpKHYq_O7bM86U3c0KaH3cS&s=10",
  "https://png.pngtree.com/thumb_back/fh260/background/20240704/pngtree-beautiful-flowers-in-the-garden-image_15852403.jpg",
  "https://fiorellaindia.com/images/decor/decor_5.webp",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRueA0blnNs5R7kEsyhUAQoBp09Y3ujrX6kXaA2a2fK8G_VMTeXtzL9z1t&s=10",
  "https://assets.simpleviewinc.com/simpleview/image/upload/c_fill,f_jpg,h_555,q_65,w_639/v1/crm/manitowocwi/IMG_4252_CD42D96E-035A-48F4-88102AA393E2B7C2-cd42d112a8b53a9_cd42dde4-b4a7-0178-ca9f9bdddd812226.jpg",
];

export function InstagramFeed({
  eyebrow = "On Instagram",
  title = "A little flower joy for your feed",
  copy = "Daily arrangements, behind-the-scenes prep, and flowers that made someone's morning — follow along for your daily dose of fresh blooms.",
  tiles = FEED_POSTS.length,
}: {
  eyebrow?: string;
  title?: string;
  copy?: string;
  tiles?: number;
}) {
  const { settings } = useSiteContent();
  const handle = settings.instagramHandle;
  const url = settings.instagramUrl || "https://www.instagram.com/freshflower.zone";

  return (
    <section className="bg-lavender px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end"
        >
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-sage-ink">
              {eyebrow}
            </p>
            <h2 className="font-display text-4xl leading-tight text-ink md:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-sm leading-7 text-ink-soft">{copy}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-sm font-semibold text-ivory shadow-sm transition hover:bg-ink-soft"
          >
            <Instagram size={16} />
            Follow @freshflower.zone
            <ArrowUpRight size={14} />
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
          className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3"
        >
          {FEED_POSTS.slice(0, tiles).map((token, index) => (
            <a
              key={`${token}-${index}`}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${handle} Instagram post ${index + 1}`}
              className="group relative flex aspect-square items-center justify-center overflow-hidden rounded-lg"
            >
              <Image
                src={token}
                alt={`${handle} on Instagram ${index + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink/0 text-ivory opacity-0 transition duration-300 group-hover:bg-ink/45 group-hover:opacity-100">
                <Instagram size={18} />
                <span className="text-xs font-semibold">{handle}</span>
              </div>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}