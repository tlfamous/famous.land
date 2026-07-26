import { NextRequest, NextResponse } from "next/server";
import { getGameAvailability, recordGameOffScan, recordScan } from "@/lib/db";
import { queueMasterActivity } from "@/lib/masterActivity";
import { getMarkerById } from "@/lib/markers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const availability = await getGameAvailability();

  const body = (await request.json().catch(() => null)) as
    | { player_id?: string; device_id?: string; marker_id?: string; is_test?: boolean }
    | null;
  const shouldRecordProgress = availability.enabled || body?.is_test === true;

  if (!body?.marker_id || (shouldRecordProgress && !body.player_id)) {
    return NextResponse.json(
      { ok: false, error: "player_id and marker_id are required while the game is on or in tester mode." },
      { status: 400 }
    );
  }

  const marker = getMarkerById(body.marker_id);
  if (!marker) {
    return NextResponse.json({ ok: false, error: "Unknown marker." }, { status: 404 });
  }

  if (!shouldRecordProgress) {
    const event = await recordGameOffScan({
      source_player_id: body.player_id,
      device_id: body.device_id,
      marker_id: marker.marker_id,
      user_agent: request.headers.get("user-agent") ?? undefined,
      is_test: body.is_test === true
    });
    if (!event.is_test) {
      await queueMasterActivity({
        projectId: "quest",
        sourceEventId: event.id,
        eventType: "quest.scan.game_off",
        severity: "info",
        title: "Quest marker scanned",
        detail: `${marker.marker_name} · game currently off`,
        occurredAt: event.scanned_at,
        metadata: { markerId: marker.marker_id, shortCode: marker.short_code }
      });
    }

    return NextResponse.json({
      ok: false,
      logged: true,
      event_id: event.id,
      game_off: true,
      error: "The Famous Land game is currently off."
    });
  }

  const result = await recordScan({
    player_id: body.player_id!,
    device_id: body.device_id,
    marker_id: marker.marker_id,
    user_agent: request.headers.get("user-agent") ?? undefined,
    is_test: body.is_test === true
  });
  if (!body.is_test && result.event_id) {
    await queueMasterActivity({
      projectId: "quest",
      sourceEventId: result.event_id,
      eventType: result.is_new ? "quest.scan.new" : "quest.scan.repeat",
      severity: result.is_new ? "success" : "info",
      title: "Quest marker scanned",
      detail: `${marker.marker_name} · ${marker.zone}`,
      occurredAt: result.event_at || new Date().toISOString(),
      metadata: {
        markerId: marker.marker_id,
        shortCode: marker.short_code,
        firstForPlayer: result.is_new
      }
    });
  }

  return NextResponse.json({
    ok: true,
    is_new: result.is_new,
    scan: result.scan
  });
}
