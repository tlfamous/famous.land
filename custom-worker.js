import handler from "./.open-next/worker.js";

export default {
  fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/July2026" || url.pathname.startsWith("/July2026/")) {
      url.pathname = url.pathname.replace("/July2026", "/july2026");
      return Response.redirect(url.toString(), 307);
    }

    return handler.fetch(request, env, ctx);
  }
};
