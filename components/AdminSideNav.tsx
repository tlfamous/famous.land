"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavLinks, isAdminNavActive } from "@/lib/adminRoutes";

export function AdminSideNav() {
  const pathname = usePathname();

  return (
    <aside className="admin-side-nav" aria-label="Admin navigation">
      <nav>
        {adminNavLinks.map((link) => {
          const isActive = isAdminNavActive(pathname, link.href);

          return (
            <Link aria-current={isActive ? "page" : undefined} href={link.href} key={link.href}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
