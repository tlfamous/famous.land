import { authorizeAdminRequest } from "@/lib/adminAuth";
import { publishGuide, type PrintValidation } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ homeId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const body = await requestJson<{ printValidation?: PrintValidation }>(request);
    if (!body.printValidation) throw new Error("A successful print check is required.");
    return homesJson(
      await publishGuide(homeId, {
        printValidation: body.printValidation,
        adminSessionId: authorization.session.id
      })
    );
  } catch (error) {
    return homesError(error);
  }
}
