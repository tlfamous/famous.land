import Image from "next/image";
import Link from "next/link";
import homesIcon from "@/app/homes/assets/homes-grounded-cabin.png";
import { LogoutButton } from "./LogoutButton";
import styles from "./homes.module.css";

export function HomesShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.homesShell}>
      <header className={styles.operatorHeader}>
        <Link className={styles.operatorBrand} href="/homes">
          <span aria-hidden="true">
            <Image
              alt=""
              height={44}
              priority
              src={homesIcon}
              width={44}
            />
          </span>
          <span>
            <strong>Famous Land</strong>
            <small>Homes</small>
          </span>
        </Link>
        <nav aria-label="Homes navigation">
          <Link href="/homes">All homes</Link>
          <Link href="/homes/purchases">Purchases</Link>
          <Link href="/quest/admin">Quest admin</Link>
          <LogoutButton />
        </nav>
      </header>
      <div className={styles.operatorMain}>{children}</div>
    </div>
  );
}
