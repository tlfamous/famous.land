"use client";

import { useState } from "react";
import styles from "./homes.module.css";

export function LogoutButton() {
  const [pending, setPending] = useState(false);

  return (
    <button
      className={styles.logoutButton}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await fetch("/api/admin/session", { method: "DELETE", credentials: "same-origin" });
        } finally {
          window.location.assign("/sign-in?next=%2Fhomes");
        }
      }}
      type="button"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
