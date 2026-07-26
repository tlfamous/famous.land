import { NextResponse } from "next/server";

export function homesJson<T>(data: T, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "private, no-store");
  return NextResponse.json({ ok: true, data }, { ...init, headers });
}

export function homesError(error: unknown) {
  const message = error instanceof Error ? error.message : "The homes request could not be completed.";
  const notFound = /not found/i.test(message);
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: notFound ? "NOT_FOUND" : "INVALID_REQUEST",
        message: notFound ? "The requested homes record was not found." : message
      }
    },
    {
      status: notFound ? 404 : 400,
      headers: { "Cache-Control": "private, no-store" }
    }
  );
}

export async function requestJson<T>(request: Request): Promise<T> {
  const body = await request.json().catch(() => undefined);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("A JSON request body is required.");
  }
  return body as T;
}
