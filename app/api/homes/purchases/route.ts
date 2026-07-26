import { authorizeAdminRequest } from "@/lib/adminAuth";
import { upsertHomePurchase, type HomePurchaseInput } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const body = await requestJson<{ purchase?: HomePurchaseInput }>(request);
    if (!body.purchase) throw new Error("A purchase record is required.");
    return homesJson(
      await upsertHomePurchase(body.purchase, { adminSessionId: authorization.session.id })
    );
  } catch (error) {
    return homesError(error);
  }
}
