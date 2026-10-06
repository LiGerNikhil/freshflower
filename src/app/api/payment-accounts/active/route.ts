import { PaymentAccountModel } from "@/lib/db/models";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe } from "@/lib/api/helpers";

export async function GET() {
  return safe(async () => {
    await dbConnect();
    const accounts = await PaymentAccountModel.find({ active: true })
      .sort({ defaultAccount: -1, updatedAt: -1 })
      .select({ label: 1, receiverName: 1, upiId: 1, qrAsset: 1, defaultAccount: 1 })
      .lean<Array<{
        _id: string;
        label: string;
        receiverName: string;
        upiId: string;
        defaultAccount?: boolean;
        qrAsset: { publicId: string; secureUrl: string; resourceType: "image"; version?: string };
      }>>();
    return jsonOk({
      accounts: accounts.map((account) => ({
        id: String(account._id),
        label: account.label,
        receiverName: account.receiverName,
        upiId: account.upiId,
        defaultAccount: account.defaultAccount === true,
        qrAsset: account.qrAsset,
      })),
    });
  });
}
