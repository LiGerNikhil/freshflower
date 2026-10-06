import { NextRequest } from "next/server";
import { verifyAdminRequest } from "@/lib/admin/session";
import { PaymentAccountModel } from "@/lib/db/models";
import { makeCrud } from "@/lib/api/crud";
import { jsonError, jsonOk, parseOrThrow, readJson, safe } from "@/lib/api/helpers";
import { paymentAccountPatchSchema } from "@/lib/validation";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    const { id } = await params;
    return jsonOk(await crud.get(id));
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return safe(async () => {
    if (!(await verifyAdminRequest(req))) return jsonError("Unauthorized.", 401);
    const { id } = await params;
    const parsed = parseOrThrow(paymentAccountPatchSchema, await readJson(req));
    const { id: _ignored, ...patch } = parsed;
    if (patch.defaultAccount && patch.active === false) {
      return jsonError("Default account must be active.", 400);
    }
    if (patch.active === false && patch.defaultAccount !== false) {
      patch.defaultAccount = false;
    }
    const result = await crud.patch(id, patch as Record<string, unknown>);
    await enforceDefaultAccount(patch.defaultAccount ? id : undefined);
    return jsonOk(result);
  });
}
