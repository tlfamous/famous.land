import { authorizeAdminRequest } from "@/lib/adminAuth";
import {
  captureAirbnbListing,
  getLatestAirbnbListingCapture,
  type AirbnbListingCaptureInput
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
    return homesJson(await getLatestAirbnbListingCapture(homeId));
  } catch (error) {
    return homesError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { homeId } = await context.params;
    const input = await requestJson<AirbnbListingCaptureInput>(request);
    return homesJson(
      await captureAirbnbListing(homeId, input, { adminSessionId: authorization.session.id })
    );
  } catch (error) {
    return homesError(error);
  }
}
