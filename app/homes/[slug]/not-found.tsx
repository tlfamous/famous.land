import type { Metadata } from "next";
import styles from "@/components/homes/homes.module.css";

export const metadata: Metadata = {
  title: "Page not found | Famous Land",
  robots: { index: false, follow: false, noarchive: true }
};

export default function HomesNotFound() {
  return (
    <div className={styles.guideNotFound}>
      <div>
        <span aria-hidden="true">⌂</span>
        <h1>Page not found</h1>
        <p>Check the address and try again.</p>
      </div>
    </div>
  );
}
