import { getLaunchStatusText } from "../../data";
import { requireJulyAdminRequest } from "../auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const deniedResponse = await requireJulyAdminRequest(request);

  if (deniedResponse) {
    return deniedResponse;
  }

  return new Response(getLaunchStatusText(), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
