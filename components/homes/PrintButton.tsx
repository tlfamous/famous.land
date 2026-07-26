"use client";

import styles from "./homes.module.css";

export function PrintButton() {
  return (
    <button className={styles.printButton} onClick={() => window.print()} type="button">
      Print or save PDF
    </button>
  );
}
