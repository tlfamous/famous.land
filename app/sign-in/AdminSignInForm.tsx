"use client";

import { FormEvent, useState } from "react";
import styles from "./sign-in.module.css";

type SignInError = {
  code?: string;
  message?: string;
};

export function AdminSignInForm({ nextPath }: { nextPath: string }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("checking");
    setMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, next: nextPath })
      });
      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; next?: string; error?: SignInError }
        | null;

      if (response.ok && result?.ok) {
        window.location.assign(result.next ?? nextPath);
        return;
      }

      setStatus("error");
      setMessage(result?.error?.message ?? "Admin sign-on could not be completed.");
    } catch {
      setStatus("error");
      setMessage("Admin sign-on is temporarily unavailable.");
    }
  }

  return (
    <div className={styles.page} data-admin-sign-in>
      <form className={styles.card} onSubmit={handleSubmit}>
        <span className={styles.eyebrow}>Famous Land</span>
        <h1>Admin sign-in</h1>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            autoFocus
            name="password"
            onChange={(event) => {
              setPassword(event.target.value);
              if (status === "error") setStatus("idle");
            }}
            required
            type="password"
            value={password}
          />
        </label>
        {status === "error" ? (
          <p className={styles.error} role="alert">
            {message}
          </p>
        ) : null}
        <button disabled={status === "checking"} type="submit">
          {status === "checking" ? "Signing in…" : "Open admin"}
        </button>
      </form>
    </div>
  );
}
