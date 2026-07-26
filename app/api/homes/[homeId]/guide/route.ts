import { authorizeAdminRequest } from "@/lib/adminAuth";
import {
  listGuideSections,
  replaceGuideSections,
  type GuideSectionInput
} from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request);
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    return homesJson(await listGuideSections(homeId));
  } catch (error) {
    return homesError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const body = await requestJson<{ sections?: GuideSectionInput[] }>(request);
    if (!Array.isArray(body.sections)) throw new Error("Guide sections are required.");
    return homesJson(
      await replaceGuideSections(homeId, body.sections, {
        adminSessionId: authorization.session.id
      })
    );
  } catch (error) {
    return homesError(error);
  }
}
