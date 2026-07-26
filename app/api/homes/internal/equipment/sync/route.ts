import { getCloudflareContext } from "@opennextjs/cloudflare";
import { listPortfolioHomeAlerts, syncAllHomeIntegrations } from "@/lib/property-ops";
import { queueMasterActivity } from "@/lib/masterActivity";
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
    const result = await syncAllHomeIntegrations();
    const alerts = await listPortfolioHomeAlerts();
    await Promise.all(
      alerts.map((alert) =>
        queueMasterActivity({
          projectId: "homes",
          sourceEventId: `current-alert:${alert.id}`,
          eventType: "homes.alert.current",
          severity: alert.severity,
          title: `${alert.homeName}: ${alert.title}`,
          detail: alert.description,
          occurredAt: alert.openedAt,
          metadata: {
            homeId: alert.homeId,
            alertType: alert.alertType,
            status: alert.status
          }
        })
      )
    );
    return homesJson(result);
  } catch (error) {
    return homesError(error);
  }
}
