import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_URL } from "@/lib/env";

// ---------------------------------------------------------------------------
// Cloudinary client — configured from the single CLOUDINARY_URL env var
// (cloudinary://API_KEY:API_SECRET@CLOUD_NAME), parsed rather than split into
// separate vars, so the credentials live only in .env.local / the hosting
// platform's environment settings.
// ---------------------------------------------------------------------------

function parseCloudinaryUrl(url: string): {
  cloud_name: string;
  api_key: string;
  api_secret: string;
} {
  const match = /^cloudinary:\/\/([^:]+):([^@]+)@([^/]+)$/.exec(url);
  if (!match) {
    throw new Error(
      "Invalid CLOUDINARY_URL. Expected cloudinary://API_KEY:API_SECRET@CLOUD_NAME",
    );
  }
  const [, api_key, api_secret, cloud_name] = match;
  return { cloud_name, api_key, api_secret };
}

let configured = false;
function configure() {
  if (configured) return;
  const { cloud_name, api_key, api_secret } = parseCloudinaryUrl(CLOUDINARY_URL());
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

export interface UploadedAsset {
  secureUrl: string;
  publicId: string;
  resourceType: "image" | "video";
}

/** Upload a raw buffer as a Cloudinary asset. Keeps no local copy. */
export async function uploadMediaBuffer(
  buffer: Buffer,
  options: { folder?: string; filename?: string; resourceType?: "image" | "video" } = {},
): Promise<UploadedAsset> {
  configure();
  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder ?? "freshflower",
          resource_type: options.resourceType ?? "image",
          ...(options.resourceType === "video" ? {} : { format: "jpg" }),
          use_filename: true,
          unique_filename: true,
          public_id: options.filename,
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary upload returned no result"));
            return;
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id as string });
        },
      );
      stream.end(buffer);
    },
  );
  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: options.resourceType ?? "image",
  };
}

/** Delete an asset by public_id (used when a product/category/blog image is replaced). */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "image" | "video" = "image",
): Promise<void> {
  configure();
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/** Build an optimized `next/image` url from a public id / secure url. */
export function buildOptimizedUrl(
  secureUrl: string,
  options: { width?: number; height?: number; crop?: "fill" | "scale" } = {},
): string {
  const { width = 800, height, crop = "scale" } = options;
  const id = lastPublicId(secureUrl);
  if (!id) return secureUrl;
  const transforms = [`w_${width}`];
  if (height) transforms.push(`h_${height}`);
  if (crop === "fill") transforms.push("c_fill");
  const account = cloudinaryIdFromUrl(secureUrl);
  return account
    ? `https://res.cloudinary.com/${account}/image/upload/${transforms.join(",")}/${id}`
    : secureUrl;
}

function lastPublicId(secureUrl: string): string | null {
  const match = /\/image\/upload\/(?:v\d+\/)?(.+)$/.exec(secureUrl);
  return match?.[1] ?? null;
}

function cloudinaryIdFromUrl(secureUrl: string): string | null {
  const match = /^https:\/\/res\.cloudinary\.com\/([^/]+)\//.exec(secureUrl);
  return match?.[1] ?? null;
}
