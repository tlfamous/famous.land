import { authorizeAdminRequest } from "@/lib/adminAuth";
import { syncEeroHome } from "@/lib/property-ops";
import { homesError, homesJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
type RouteContext = { params: Promise<{ homeId: string }> };
export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try { const { homeId } = await context.params; return homesJson(await syncEeroHome(homeId)); }
  catch (error) { return homesError(error); }
}
