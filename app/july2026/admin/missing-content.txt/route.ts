import { getLaunchCompletionRequestText } from "../../data";

export function GET() {
  return new Response(getLaunchCompletionRequestText(), {
    headers: {
      "cache-control": "public, max-age=3600",
      "content-disposition": 'attachment; filename="famous-land-july-2026-missing-content.txt"',
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
