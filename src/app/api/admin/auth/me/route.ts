import { NextRequest } from "next/server";
import { adminUsers } from "@/lib/data/admin";
import { verifyAdminRequest } from "@/lib/admin/session";
import { jsonError, jsonOk } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  if (!(await verifyAdminRequest(request))) return jsonError("Unauthorized.", 401);
  return jsonOk({ user: adminUsers[0] });
}
