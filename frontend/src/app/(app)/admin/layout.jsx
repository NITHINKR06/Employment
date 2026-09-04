"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRequireAuth } from "@/lib/useRequireAuth";

const ADMIN_LINKS = [
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/verification", label: "Verification" },
];

export default function AdminLayout({ children }) {
  const { user, isLoading } = useRequireAuth();
  const pathname = usePathname();

  if (isLoading || !user) {
    return (
      <div className="container py-10">
        <p className="text-body-md text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  // Cosmetic-only gate — the backend independently enforces require_role("ADMIN")
  // on every /admin/* endpoint, this just avoids flashing the UI at non-admins.
  if (user.role !== "ADMIN") {
    return (
      <div className="container py-10">
        <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          You don&apos;t have access to this page.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="font-display text-headline-md text-on-surface">Admin</h1>
      <div className="mt-6 flex gap-2 border-b border-outline-variant/60">
        {ADMIN_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-4 py-2 text-label-md font-semibold transition-colors ${
              pathname === link.href
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
