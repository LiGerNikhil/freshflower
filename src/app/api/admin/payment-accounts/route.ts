import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { PaymentAccountModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { paymentAccountSchema } from "@/lib/validation";

const crud = makeCrud(PaymentAccountModel);

async function enforceDefaultAccount(preferredId?: string) {
  const preferred = preferredId
    ? await PaymentAccountModel.findOne({ _id: preferredId, active: true }).select({ _id: 1 }).lean<{ _id: string }>()
    : null;
  const currentDefault = await PaymentAccountModel.findOne({ active: true, defaultAccount: true })
    .select({ _id: 1 })
    .lean<{ _id: string }>();
  const latestActive = await PaymentAccountModel.findOne({ active: true })
    .sort({ updatedAt: -1 })
    .select({ _id: 1 })
    .lean<{ _id: string }>();
  const fallback = preferred ?? currentDefault ?? latestActive;
  await PaymentAccountModel.updateMany({}, { $set: { defaultAccount: false } }).lean();
  if (fallback) {
    await PaymentAccountModel.updateOne({ _id: fallback._id }, { $set: { defaultAccount: true } }).lean();
  }
}

export async function GET() {
  return safe(async () => jsonOk(await crud.list()));
}

export async function POST(req: NextRequest) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    const parsed = parseOrThrow(paymentAccountSchema, await readJson(req));
    await crud.upsert(parsed.id, parsed as Record<string, unknown>);
    await enforceDefaultAccount(parsed.active ? parsed.defaultAccount ? parsed.id : undefined : undefined);
    return jsonOk({ ok: true, id: parsed.id }, 201);
  });
}
