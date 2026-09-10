import { NextRequest } from "next/server";
import { ContactEnquiryModel, WeddingEnquiryModel, WholesaleEnquiryModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonOk, safe, readJson, parseOrThrow } from "@/lib/api/helpers";
import { enquiryStatusSchema } from "@/lib/validation";

const MODELS: Record<string, ReturnType<typeof makeCrud<unknown>>> = {
  wholesale: makeCrud(WholesaleEnquiryModel),
  wedding: makeCrud(WeddingEnquiryModel),
  contact: makeCrud(ContactEnquiryModel),
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  return safe(async () => {
    const { kind, id } = await params;
    const crud = MODELS[kind];
    if (!crud) return jsonOk({ error: "Unknown enquiry kind." }, 404);
    const parsed = parseOrThrow(enquiryStatusSchema, await readJson(req));
    return jsonOk(await crud.patch(id, parsed as Record<string, unknown>));
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
  return safe(async () => {
    const { kind, id } = await params;
    const crud = MODELS[kind];
    if (!crud) return jsonOk({ error: "Unknown enquiry kind." }, 404);
    return jsonOk(await crud.remove(id));
  });
}