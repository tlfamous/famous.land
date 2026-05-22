import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // This app is mostly dynamic API routes plus static pages. R2 incremental
  // caching can be added later if the site grows beyond this lightweight game.
});
