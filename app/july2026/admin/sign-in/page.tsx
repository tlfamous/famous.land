"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "../admin.module.css";

export default function July2026AdminSignInPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/july2026/admin";
    }

    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    return next?.startsWith("/july2026/admin") && !next.startsWith("/july2026/admin/sign-in")
      ? next
      : "/july2026/admin";
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("checking");

    const response = await fetch("/api/july2026/admin-auth", {
      body: JSON.stringify({ password }),
      headers: {
        "content-type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    window.location.assign(nextPath);
  }

  return (
    <main className={styles.signInPage}>
      <form className={styles.signInCard} onSubmit={handleSubmit}>
        <span className={styles.label}>July 2026 Admin</span>
        <h1>Sign on</h1>
        <p>Enter the admin password. This browser will stay signed on for 30 days.</p>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            autoFocus
            onChange={(event) => {
              setPassword(event.target.value);
              if (status === "error") {
                setStatus("idle");
              }
            }}
            type="password"
            value={password}
          />
        </label>
        {status === "error" ? <strong className={styles.signInError}>Incorrect password.</strong> : null}
        <button disabled={status === "checking"} type="submit">
          {status === "checking" ? "Checking..." : "Open admin"}
        </button>
      </form>
    </main>
  );
}

