"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  getLocalScannedMarkers,
  getOrCreatePlayerId,
  markProgressSaved
} from "@/lib/localPlayer";

export function SaveProgressForm() {
  const [email, setEmail] = useState("");
  const [markerCount, setMarkerCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");

  useEffect(() => {
    setMarkerCount(getLocalScannedMarkers().length);
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setMessage("");
    setRecoveryCode("");

    const playerId = getOrCreatePlayerId();
    const markerIds = getLocalScannedMarkers();

    const response = await fetch("/api/save-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        player_id: playerId,
        email,
        marker_ids: markerIds
      })
    });

    const data = (await response.json()) as {
      ok?: boolean;
      error?: string;
      message?: string;
      recovery_code?: string;
      mode?: "stub";
    };

    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage(data.error ?? "Progress could not be saved. Try again when you have service.");
      return;
    }

    markProgressSaved(email);
    setStatus("saved");
    setMessage(data.message ?? "Progress saved.");
    if (data.recovery_code) {
      setRecoveryCode(data.recovery_code);
    }
  }

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Save your progress</p>
        <h1>Keep your Famous Land Quest going all summer.</h1>
        <p>
          Enter your email and we will let you recover your progress if you switch phones,
          clear your browser, or come back later.
        </p>
      </section>

      <section className="card">
        <div className="split">
          <strong>Markers on this phone</strong>
          <span>{markerCount}</span>
        </div>
        {markerCount < 5 ? (
          <p className="notice">
            Save progress unlocks after 5 marker finds. You can still explore without
            saving.
          </p>
        ) : null}

        <form className="form" onSubmit={onSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            inputMode="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <p className="form-note">
            Email is optional and private. It is only used to recover progress. No
            passwords.
          </p>
          <button className="button primary" disabled={status === "saving"} type="submit">
            {status === "saving" ? "Saving..." : "Save my progress"}
          </button>
        </form>

        {message ? (
          <div className={status === "error" ? "notice error" : "notice"}>
            <p>{message}</p>
            {recoveryCode ? (
              <p>
                Recovery code for this local stub: <strong>{recoveryCode}</strong>
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <Link className="button secondary" href="/progress">
        Back to progress
      </Link>
    </div>
  );
}
