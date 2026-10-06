import { PaymentAccountModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe } from "@/lib/api/helpers";

export async function GET() {
  return safe(async () => {
    await dbConnect();
    const account = await PaymentAccountModel.findOne({ active: true, defaultAccount: true })
      .select({ label: 1, receiverName: 1, upiId: 1, qrAsset: 1 })
      .lean<{
        _id: string;
        label: string;
        receiverName: string;
        upiId: string;
        qrAsset: { publicId: string; secureUrl: string; resourceType: "image"; version?: string };
      }>();
    if (!account) return jsonOk({ account: null });
    return jsonOk({
      account: {
        id: String(account._id),
        label: account.label,
        receiverName: account.receiverName,
        upiId: account.upiId,
        qrAsset: account.qrAsset,
      },
    });
  });
}
