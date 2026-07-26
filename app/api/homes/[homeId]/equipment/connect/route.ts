import { authorizeAdminRequest } from "@/lib/adminAuth";
import {
  connectHomeIntegration,
  isHomeIntegrationProvider
} from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };
type ConnectInput = { provider?: unknown; username?: unknown; password?: unknown };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const input = await requestJson<ConnectInput>(request);
    if (!isHomeIntegrationProvider(input.provider)) {
      throw new Error("Choose Mopeka or EcoNet.");
    }
    if (typeof input.username !== "string" || typeof input.password !== "string") {
      throw new Error("Enter the email and password used by the vendor app.");
    }
    return homesJson(
      await connectHomeIntegration(homeId, input.provider, {
        username: input.username,
        password: input.password
      })
    );
  } catch (error) {
    return homesError(error);
  }
}
