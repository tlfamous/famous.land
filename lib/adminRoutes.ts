export const adminNavLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/game", label: "Game" },
  { href: "/test", label: "Test" },
  { href: "/maps", label: "Land" },
  { href: "/admin/players", label: "Players" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/backlog", label: "Feature Backlog" }
];

const adminPathPrefixes = ["/admin", "/test", "/maps"];

export function isAdminPath(pathname: string) {
  return adminPathPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isAdminNavActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  if (href === "/admin/game" && pathname.startsWith("/admin/design")) {
    return true;
  }

  if (href === "/admin/messages" && pathname.startsWith("/admin/recovery")) {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
