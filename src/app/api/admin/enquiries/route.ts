import { NextRequest } from "next/server";
import { ContactEnquiryModel, WeddingEnquiryModel, WholesaleEnquiryModel } from "@/lib/db/models";
import { serializeList } from "@/lib/db/repositories";
import { dbConnect } from "@/lib/db/connect";
import { jsonOk, safe } from "@/lib/api/helpers";

export async function GET() {
  return safe(async () => {
    await dbConnect();
    const [wholesale, wedding, contact] = await Promise.all([
      WholesaleEnquiryModel.find().sort({ _id: 1 }).lean(),
      WeddingEnquiryModel.find().sort({ _id: 1 }).lean(),
      ContactEnquiryModel.find().sort({ _id: 1 }).lean(),
    ]);
    return jsonOk({
      wholesale: serializeList(wholesale),
      wedding: serializeList(wedding),
      contact: serializeList(contact),
    });
  });
}

// POST is handled by the public /api/enquiry routes per type.
export async function POST() {
  return jsonOk({ error: "Submit enquiries via /api/enquiry/contact, /api/enquiry/wholesale or /api/enquiry/wedding." }, 405);
}

export async function PATCH(_req: NextRequest) {
  return jsonOk({ error: "Patch enquiries via /api/admin/enquiries/[kind]/[id]." }, 405);
}

export async function DELETE() {
  return jsonOk({ error: "Delete enquiries via /api/admin/enquiries/[kind]/[id]." }, 405);
}