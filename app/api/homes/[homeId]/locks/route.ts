import { authorizeAdminRequest } from "@/lib/adminAuth";
import { listHomeActivityEvents, listHomeLockDevices, listHomeLockEvents } from "@/lib/property-ops";
import { homesError, homesJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const [devices, events, activity] = await Promise.all([
      listHomeLockDevices(homeId),
      listHomeLockEvents(homeId),
      listHomeActivityEvents(homeId)
    ]);
    return homesJson({ devices, events, activity });
  } catch (error) {
    return homesError(error);
  }
}
