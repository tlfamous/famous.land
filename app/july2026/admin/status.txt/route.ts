import { getLaunchStatusText } from "../../data";

export const dynamic = "force-static";

export function GET() {
  return new Response(getLaunchStatusText(), {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
