import { authorizeAdminRequest } from "@/lib/adminAuth";
import { acknowledgeHomeAlert } from "@/lib/property-ops";
import { homesError, homesJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ alertId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { alertId } = await context.params;
    return homesJson(await acknowledgeHomeAlert(alertId, authorization.session.id));
  } catch (error) {
    return homesError(error);
  }
}
