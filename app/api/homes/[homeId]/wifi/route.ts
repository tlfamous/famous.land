import { authorizeAdminRequest } from "@/lib/adminAuth";
import { setWifiCredentials, type WifiCredentials } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const credentials = await requestJson<WifiCredentials>(request);
    await setWifiCredentials(homeId, credentials, {
      adminSessionId: authorization.session.id
    });
    return homesJson({ configured: true });
  } catch (error) {
    return homesError(error);
  }
}
