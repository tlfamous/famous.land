"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAdminPath } from "@/lib/adminRoutes";
import { TESTER_SCAN_SOURCE } from "@/lib/testerMode";

export function Header() {
  const pathname = usePathname();
  const [isTesterMode, setIsTesterMode] = useState(false);
  const isAdminSection = isAdminPath(pathname);
  const brandHref = isAdminSection ? "https://famous.land/admin" : "/";
  const navLabel = "Main navigation";
  const navLinks = [
    { href: "/safety", label: "Safety", pathname: "/safety" },
    {
      href: isTesterMode ? `/quest?scan_source=${TESTER_SCAN_SOURCE}` : "/quest",
      label: "Quest",
      pathname: "/quest"
    }
  ];

  useEffect(() => {
    setIsTesterMode(new URLSearchParams(window.location.search).get("scan_source") === TESTER_SCAN_SOURCE);
  }, [pathname]);

  return (
    <header className={isAdminSection ? "site-header admin-site-header" : "site-header"}>
      <Link className="brand" href={brandHref}>
        <span className="brand-mark" aria-hidden="true">
          🐄
        </span>
        <span className="brand-text">
          <strong>FAMOUS LAND</strong>
          {isAdminSection ? <small>Admin</small> : null}
        </span>
      </Link>
      {!isAdminSection ? (
        <nav aria-label={navLabel}>
          {navLinks.map((link) => (
            <Link
              aria-current={pathname === link.pathname ? "page" : undefined}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
          <Link
            className="help-link"
            href="/contact"
            aria-label="Contact support"
            title="Contact support"
          >
            ?
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
