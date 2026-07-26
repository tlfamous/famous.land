import { authorizeAdminRequest } from "@/lib/adminAuth";
import { deleteHomePurchase } from "@/lib/property-ops";
import { homesError, homesJson } from "../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteContext = { params: Promise<{ purchaseId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  const authorization = await authorizeAdminRequest(request, { mutation: true });
  if (!authorization.ok) return authorization.response;
  try {
    const { purchaseId } = await context.params;
    await deleteHomePurchase(purchaseId, { adminSessionId: authorization.session.id });
    return homesJson({ id: purchaseId });
  } catch (error) {
    return homesError(error);
  }
}
