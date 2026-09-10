"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";

/**
 * Real Cloudinary-backed image picker for admin forms.
 *
 * Uploads picked files to POST /api/admin/upload (which stores them in
 * Cloudinary) and hands back the returned secure URLs. Replacements call
 * DELETE /api/admin/upload?id=<publicId> for Cloudinary-hosted assets so the
 * media library doesn't fill up with orphaned originals; gradient tokens and
 * other preview URLs are left untouched.
 */
export function CloudinaryUpload({
  value,
  onChange,
  label = "Add images",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const next: string[] = [];
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Upload failed");
        }
        const { secureUrl } = (await res.json()) as { secureUrl: string };
        next.push(secureUrl);
      }
      onChange([...value, ...next]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong, please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function remove(url: string) {
    const next = value.filter((v) => v !== url);
    onChange(next);
    const match = /^https:\/\/res\.cloudinary\.com\/.+\/image\/upload\/(?:v\d+\/)?(.+)$/.exec(
      url,
    );
    if (match) {
      try {
        await fetch(`/api/admin/upload?id=${encodeURIComponent(match[1])}`, {
          method: "DELETE",
        });
      } catch {
        // Deleting the remote asset is best-effort; the local list is already updated.
      }
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {value.map((image, index) => (
          <div key={`${image}-${index}`} className="relative">
            {image.startsWith("gradient-") || image.startsWith("data:") ? (
              <div
                title={image}
                className="flex h-16 w-16 items-center justify-center rounded-lg bg-sage-ink/15 text-xs font-semibold text-sage-ink"
              >
                Token
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={`Uploaded image ${index + 1}`}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => remove(image)}
              aria-label={`Remove image ${index + 1}`}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-ink p-1 text-ivory shadow hover:bg-ink-soft"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-md bg-blush px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-ink/25 px-4 py-2.5 text-sm font-semibold text-ink-soft hover:border-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-50">
        {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
        {uploading ? "Uploading…" : label}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          disabled={uploading}
          onChange={(event) => handleFiles(event.target.files)}
          className="sr-only"
        />
      </label>
    </div>
  );
}