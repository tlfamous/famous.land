import { authorizeAdminRequest } from "@/lib/adminAuth";
import {
  getHomeForManagement,
  updateHome,
  type HomeUpdateInput
} from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const home = await getHomeForManagement(homeId);
    if (!home) throw new Error("Home not found.");
    return homesJson(home);
  } catch (error) {
    return homesError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const input = await requestJson<HomeUpdateInput>(request);
    return homesJson(
      await updateHome(homeId, input, { adminSessionId: authorization.session.id })
    );
  } catch (error) {
    return homesError(error);
  }
}
