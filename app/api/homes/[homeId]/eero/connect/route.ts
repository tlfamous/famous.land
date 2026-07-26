import { authorizeAdminRequest } from "@/lib/adminAuth";
import { startEeroVerification } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type RouteContext = { params: Promise<{ homeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const { login } = await requestJson<{ login?: string }>(request);
    return homesJson(await startEeroVerification(homeId, login || ""));
  } catch (error) { return homesError(error); }
}
