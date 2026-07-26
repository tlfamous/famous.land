import { authorizeAdminRequest } from "@/lib/adminAuth";
import { importHomePurchases, type HomePurchaseInput } from "@/lib/property-ops";
import { homesError, homesJson, requestJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const body = await requestJson<{ purchases?: HomePurchaseInput[] }>(request);
    if (!Array.isArray(body.purchases)) throw new Error("Purchase records are required.");
    return homesJson(
      await importHomePurchases(body.purchases, { adminSessionId: authorization.session.id })
    );
  } catch (error) {
    return homesError(error);
  }
}
