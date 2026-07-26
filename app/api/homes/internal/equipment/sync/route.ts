import { getCloudflareContext } from "@opennextjs/cloudflare";
import { syncAllHomeIntegrations } from "@/lib/property-ops";
import { homesError, homesJson } from "../../../_utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function configuredSecret() {
  try {
    return ((await getCloudflareContext({ async: true })).env as {
      HOMES_EERO_CRON_SECRET?: string;
    }).HOMES_EERO_CRON_SECRET?.trim();
  } catch {
    return process.env.HOMES_EERO_CRON_SECRET?.trim();
  }
}

export async function POST(request: Request) {
  const expected = await configuredSecret();
  if (!expected || request.headers.get("x-homes-monitor-cron-secret") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    return homesJson(await syncAllHomeIntegrations());
  } catch (error) {
    return homesError(error);
  }
}
