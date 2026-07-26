import { authorizeAdminRequest } from "@/lib/adminAuth";
import { listHomes } from "@/lib/property-ops";
import { homesError, homesJson } from "./_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    return homesJson(await listHomes());
  } catch (error) {
    return homesError(error);
  }
}
