import { authorizeAdminRequest } from "@/lib/adminAuth";
import { syncSeamLocks } from "@/lib/property-ops";
import { homesError, homesJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    return homesJson(await syncSeamLocks());
  } catch (error) {
    return homesError(error);
  }
}
