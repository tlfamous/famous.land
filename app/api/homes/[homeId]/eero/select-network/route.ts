import { authorizeAdminRequest } from "@/lib/adminAuth";
import { selectEeroNetwork } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type RouteContext = { params: Promise<{ homeId: string }> };
export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try { const { homeId } = await context.params; const { networkId } = await requestJson<{ networkId?: string }>(request); return homesJson(await selectEeroNetwork(homeId, networkId || "")); }
  catch (error) { return homesError(error); }
}
