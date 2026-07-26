import { getCloudflareContext } from "@opennextjs/cloudflare";

export type MasterActivityProject = "alex" | "events" | "homes" | "quest";
export type MasterActivitySeverity = "info" | "success" | "warning" | "critical";

export type MasterActivityEvent = {
  projectId: MasterActivityProject;
  sourceEventId: string;
  eventType: string;
  severity?: MasterActivitySeverity;
  title: string;
  detail?: string;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean | null>;
};

type ActivityEnvironment = {
  FAMOUS_ADMIN_ACTIVITY_URL?: string;
  FAMOUS_ADMIN_ACTIVITY_SECRET?: string;
  FAMOUS_ADMIN_SSO_SECRET?: string;
};

async function sendMasterActivity(event: MasterActivityEvent, env: ActivityEnvironment) {
  const secret = (
    env.FAMOUS_ADMIN_ACTIVITY_SECRET || env.FAMOUS_ADMIN_SSO_SECRET
  )?.trim();
  if (!secret) return;
  const baseUrl = env.FAMOUS_ADMIN_ACTIVITY_URL?.trim() || "https://admin.famous.land";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2_500);

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/+$/u, "")}/api/activity/ingest/${event.projectId}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${secret}`,
          "content-type": "application/json"
        },
        body: JSON.stringify({
          sourceEventId: event.sourceEventId,
          eventType: event.eventType,
          severity: event.severity || "info",
          title: event.title,
          detail: event.detail,
          occurredAt: event.occurredAt,
          metadata: event.metadata
        }),
        signal: controller.signal
      }
    );
    if (!response.ok) {
      console.warn(`Master activity rejected ${event.eventType}: ${response.status}`);
    }
  } catch (error) {
    console.warn("Master activity delivery failed", error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function queueMasterActivity(event: MasterActivityEvent) {
  try {
    const context = (await getCloudflareContext({ async: true })) as {
      env: ActivityEnvironment;
      ctx?: { waitUntil?: (promise: Promise<unknown>) => void };
    };
    const delivery = sendMasterActivity(event, context.env);
    if (context.ctx?.waitUntil) {
      context.ctx.waitUntil(delivery);
      return;
    }
    await delivery;
  } catch (error) {
    console.warn("Master activity could not be queued", error);
  }
}
