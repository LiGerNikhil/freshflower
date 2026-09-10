import { NextRequest } from "next/server";
import { SeoRouteOverrideModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe } from "@/lib/api/helpers";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ path: string }> }) {
  return safe(async () => {
    const { path } = await params;
    await dbConnect();
    await SeoRouteOverrideModel.findByIdAndDelete(path).lean();
    return jsonOk({ ok: true });
  });
}