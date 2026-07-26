import handler from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/July2026" || url.pathname.startsWith("/July2026/")) {
      url.pathname = url.pathname.replace("/July2026", "/july2026");
      return Response.redirect(url.toString(), 307);
    }

    const response = await handler.fetch(request, env, ctx);

    if (url.pathname === "/homes" || url.pathname.startsWith("/homes/")) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "private, no-store, max-age=0");
      headers.set("Referrer-Policy", "no-referrer");
      headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  },
  async scheduled(controller, env, ctx) {
    if (!env.HOMES_EERO_CRON_SECRET) return;
    const equipmentPoll = controller.cron === "7 * * * *";
    const url = equipmentPoll
      ? "https://famous.land/api/homes/internal/equipment/sync"
      : "https://famous.land/api/homes/internal/eero/sync";
    const header = equipmentPoll
      ? "x-homes-monitor-cron-secret"
      : "x-homes-eero-cron-secret";
    ctx.waitUntil(
      handler.fetch(
        new Request(url, {
          method: "POST",
          headers: { [header]: env.HOMES_EERO_CRON_SECRET }
        }),
        env,
        ctx
      )
    );
  }
};
