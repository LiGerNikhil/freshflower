import { NextRequest, NextResponse } from "next/server";
import { uploadMediaBuffer, deleteCloudinaryAsset } from "@/lib/cloudinary";

// ---------------------------------------------------------------------------
// Admin media upload endpoint.
//
// POST /api/admin/upload   — multipart form, field "file" → Cloudinary, returns
//                            { secureUrl, publicId }.
// DELETE /api/admin/upload?id=<publicId>  — removes the asset.
//
// NOTE: server-side admin auth is still stubbed (Phase 12 – real session stays
// a TODO). This endpoint is intended to live behind the future admin session
// check; until then it should not be reachable from the public internet.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Missing file: send a multipart form with a 'file' field." },
        { status: 400 },
      );
    }
    const resourceType = form.get("resourceType") === "video" ? "video" : "image";
    const allowed =
      resourceType === "video"
        ? ["video/mp4", "video/webm", "video/quicktime"]
        : ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported ${resourceType} type "${file.type}".` },
        { status: 400 },
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    const maxBytes = resourceType === "video" ? 40 * 1024 * 1024 : 8 * 1024 * 1024;
    if (bytes.length === 0 || bytes.length > maxBytes) {
      return NextResponse.json(
        { error: `${resourceType === "video" ? "Video" : "Image"} must be between 1 byte and ${maxBytes / 1024 / 1024} MB.` },
        { status: 400 },
      );
    }

    const asset = await uploadMediaBuffer(bytes, { folder: "freshflower", resourceType });
    return NextResponse.json(asset);
  } catch (error) {
    console.error("[api/admin/upload] failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while uploading — please try again." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const publicId = request.nextUrl.searchParams.get("id");
    const resourceType = request.nextUrl.searchParams.get("resourceType") === "video" ? "video" : "image";
    if (!publicId) {
      return NextResponse.json(
        { error: "Missing 'id' (public_id) query param." },
        { status: 400 },
      );
    }
    await deleteCloudinaryAsset(publicId, resourceType);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/upload] delete failed:", error);
    return NextResponse.json(
      { error: "Something went wrong while deleting the asset — please try again." },
      { status: 500 },
    );
  }
}
