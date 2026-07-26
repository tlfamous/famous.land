import { authorizeAdminRequest } from "@/lib/adminAuth";
import { selectHomeIntegrationDevice } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };
type SelectInput = { integrationId?: unknown; externalDeviceId?: unknown };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const input = await requestJson<SelectInput>(request);
    if (typeof input.integrationId !== "string" || typeof input.externalDeviceId !== "string") {
      throw new Error("Choose a discovered device.");
    }
    return homesJson(
      await selectHomeIntegrationDevice(homeId, input.integrationId, input.externalDeviceId)
    );
  } catch (error) {
    return homesError(error);
  }
}
