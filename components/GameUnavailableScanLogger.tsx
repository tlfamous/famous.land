"use client";

import { useEffect } from "react";
import { getExistingPlayerId } from "@/lib/localPlayer";

export function GameUnavailableScanLogger({ markerId }: { markerId: string }) {
  useEffect(() => {
    const playerId = getExistingPlayerId();
    const isTestScan =
      new URLSearchParams(window.location.search).get("scan_source") === "tester";

    fetch("/api/scan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: playerId || undefined,
        marker_id: markerId,
        is_test: isTestScan
      }),
      keepalive: true
    }).catch(() => {
      // The off-game page should still render even if reporting is briefly unavailable.
    });
  }, [markerId]);

  return null;
}
