"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { hostSmsHref } from "./data";
import styles from "./july2026-shell.module.css";

export function July2026Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/july2026/admin");

  if (isAdmin) {
    return children;
  }

  return (
    <div className={styles.shell}>
      <nav className={styles.topbar} aria-label="July 2026 event navigation">
        <div className={styles.navLinks}>
          <a href="/july2026#schedule">Schedule</a>
          <a href="/july2026/houses">Houses</a>
          <a href="/july2026/meals">Meals</a>
          <a href={hostSmsHref}>Contact Host</a>
        </div>
      </nav>
      {children}
    </div>
  );
}
