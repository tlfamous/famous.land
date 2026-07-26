import { authorizeAdminRequest } from "@/lib/adminAuth";
import { syncHomeIntegration } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };
type SyncInput = { integrationId?: unknown };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const input = await requestJson<SyncInput>(request);
    if (typeof input.integrationId !== "string") {
      throw new Error("Choose an equipment integration to refresh.");
    }
    return homesJson(await syncHomeIntegration(homeId, input.integrationId));
  } catch (error) {
    return homesError(error);
  }
}
