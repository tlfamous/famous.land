"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { applyRecoveredProgress } from "@/lib/localPlayer";

type RecoveryStatus = "checking" | "desktop" | "recovering" | "recovered" | "error";

type RecoveryResponse =
  {
    ok?: boolean;
    mode?: "recovered" | "not_found";
    player_id?: string;
    marker_ids?: string[];
    message?: string;
    error?: string;
  };

export function RecoverLinkClient({ recoveryCode }: { recoveryCode: string }) {
  const [status, setStatus] = useState<RecoveryStatus>("checking");
  const [message, setMessage] = useState("Checking this device...");
  const [markerCount, setMarkerCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isLikelyQuestPhone()) {
      setStatus("desktop");
      setMessage(
        "Please open this same email on your phone, tap Recover there, then return to the quest."
      );
      return;
    }

    let cancelled = false;

    async function recoverProgress() {
      setStatus("recovering");
      setMessage("Recovering your quest progress on this phone...");

      const response = await fetch(`/api/recover/${encodeURIComponent(recoveryCode)}`, {
        method: "POST"
      });
      const data = (await response.json().catch(() => null)) as RecoveryResponse | null;

      if (cancelled) return;

      if (
        !response.ok ||
        !data?.ok ||
        data.mode !== "recovered" ||
        !data.player_id ||
        !data.marker_ids
      ) {
        setStatus("error");
        setMessage(
          data?.message ??
            data?.error ??
            "That recovery link did not work. Request a new recovery email and try again."
        );
        return;
      }

      applyRecoveredProgress(data.player_id, data.marker_ids);
      setMarkerCount(data.marker_ids.length);
      setStatus("recovered");
      setMessage(`Recovered ${data.marker_ids.length} marker finds on this phone.`);
    }

    recoverProgress();

    return () => {
      cancelled = true;
    };
  }, [recoveryCode]);

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Recover progress</p>
        <h1>{headingForStatus(status)}</h1>
        <p>{message}</p>
      </section>

      <section className="card">
        {status === "desktop" ? (
          <div className="notice">
            <p>
              Recovery restores progress into the browser storage on the device
              running the quest. Open the email on your phone, tap Recover, and your
              progress will be restored there.
            </p>
          </div>
        ) : null}

        {status === "recovering" || status === "checking" ? (
          <div className="notice">
            <p>Keep this page open for a moment.</p>
          </div>
        ) : null}

        {status === "recovered" ? (
          <div className="notice">
            <p>
              {markerCount === 1
                ? "One marker find is back on this phone."
                : `${markerCount ?? 0} marker finds are back on this phone.`}
            </p>
            <p>Return to the quest and keep going.</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="notice error">
            <p>{message}</p>
          </div>
        ) : null}
      </section>

      {status === "recovered" || status === "error" ? (
        <div className="button-row">
          {status === "recovered" ? (
            <Link className="button primary" href="/quest">
              Return to quest
            </Link>
          ) : null}
          {status === "error" ? (
            <Link className="button primary" href="/contact">
              Contact support
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function headingForStatus(status: RecoveryStatus): string {
  if (status === "desktop") return "Open this link on your phone.";
  if (status === "recovered") return "Your progress is recovered.";
  if (status === "error") return "This recovery link needs a reset.";
  return "Recovering your progress.";
}

function isLikelyQuestPhone(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const mobileUserAgent = /Android|iPhone|iPod|IEMobile|Mobile/i.test(userAgent);
  const hasCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  const touchSmallScreen = navigator.maxTouchPoints > 0 && hasCoarsePointer && shortSide <= 820;

  return mobileUserAgent || touchSmallScreen;
}
