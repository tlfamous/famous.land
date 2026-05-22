"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminPath } from "@/lib/adminRoutes";

export function Header() {
  const pathname = usePathname();
  const isAdminSection = isAdminPath(pathname);
  const brandHref = isAdminSection ? "https://famous.land/admin" : "/";
  const navLabel = "Main navigation";
  const navLinks = [
    { href: "/safety", label: "Safety" },
    { href: "/quest", label: "Quest" }
  ];

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
              aria-current={pathname === link.href ? "page" : undefined}
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
