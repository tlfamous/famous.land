"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { applyRecoveredProgress } from "@/lib/localPlayer";

export function RecoverForm() {
  const [email, setEmail] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "recovered" | "stub" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const response = await fetch("/api/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        recovery_code: recoveryCode
      })
    });

    const data = (await response.json()) as
      | {
          ok?: boolean;
          error?: string;
          mode?: "stub";
          message?: string;
        }
      | {
          ok?: boolean;
          mode?: "recovered";
          player_id: string;
          marker_ids: string[];
          message?: string;
        };

    if (!response.ok || !data.ok) {
      setStatus("error");
      setMessage("Recovery could not be started. Check the email and try again.");
      return;
    }

    if (data.mode === "recovered") {
      applyRecoveredProgress(data.player_id, data.marker_ids);
      setStatus("recovered");
      setMessage(`Recovered ${data.marker_ids.length} marker finds on this device.`);
      return;
    }

    setStatus("stub");
    setMessage(
      data.message ??
        "Recovery email sending is stubbed until an email provider is connected."
    );
  }

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">Recover progress</p>
        <h1>Pick up your summer quest on this phone.</h1>
        <p>
          Use the email you saved with. In production, this page sends a magic link. In
          local development, use the recovery code shown when saving progress.
        </p>
      </section>

      <section className="card">
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

          <label htmlFor="recovery-code">Recovery code</label>
          <input
            id="recovery-code"
            autoComplete="one-time-code"
            placeholder="Optional for local stub"
            value={recoveryCode}
            onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())}
          />
          <p className="form-note">
            No password is needed. The production version should send a short-lived magic
            link by email.
          </p>
          <button className="button primary" disabled={status === "sending"} type="submit">
            {status === "sending" ? "Checking..." : "Recover progress"}
          </button>
        </form>

        {message ? (
          <div className={status === "error" ? "notice error" : "notice"}>
            <p>{message}</p>
          </div>
        ) : null}
      </section>

      <Link className="button secondary" href="/progress">
        Back to progress
      </Link>
    </div>
  );
}
