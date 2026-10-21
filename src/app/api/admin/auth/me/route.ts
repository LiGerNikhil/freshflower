import { NextRequest } from "next/server";
import { getRequestAdmin } from "@/lib/admin/authorization";
import { jsonError, jsonOk, safe } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  return safe(async () => {
    const user = await getRequestAdmin(request);
    return user ? jsonOk({ user }) : jsonError("Unauthorized.", 401);
  });
}
