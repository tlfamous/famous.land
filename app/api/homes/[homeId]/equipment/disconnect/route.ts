import { authorizeAdminRequest } from "@/lib/adminAuth";
import { disconnectHomeIntegration } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };
type DisconnectInput = { integrationId?: unknown };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const input = await requestJson<DisconnectInput>(request);
    if (typeof input.integrationId !== "string") {
      throw new Error("Choose an equipment integration to disconnect.");
    }
    await disconnectHomeIntegration(homeId, input.integrationId);
    return homesJson({ disconnected: true });
  } catch (error) {
    return homesError(error);
  }
}
