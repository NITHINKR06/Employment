"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  IoMenuOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoNotificationsOutline,
  IoLogOutOutline,
  IoPersonAddOutline,
  IoLogInOutline,
} from "react-icons/io5";
import ThemeToggle from "@/components/Navbar/ThemeToggle";
import { SITE_NAME } from "@/lib/constants";
import { notifications } from "@/data/notifications";
import { useAuth } from "@/lib/AuthProvider";
import { getNavLinks } from "@/components/Navbar/navLinks";

function isLinkActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ links, pathname, collapsed, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = isLinkActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            title={collapsed ? link.label : undefined}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md transition-colors ${
              collapsed ? "justify-center" : ""
            } ${
              active
                ? "bg-primary-container text-on-primary-container font-semibold"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <Icon size={20} className="shrink-0" aria-hidden="true" />
            {!collapsed && <span>{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ onBellClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoggedIn = !isLoading && !!user;
  const navLinks = getNavLinks(isLoggedIn ? user : null);
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);

  const handleLogout = async () => {
    await logout();
    setDrawerOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* Mobile top strip */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-4 md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 text-on-surface-variant"
        >
          <IoMenuOutline size={26} />
        </button>
        <Link href="/" className="font-display text-headline-sm font-bold text-primary">
          {SITE_NAME}
        </Link>
        <div className="flex items-center gap-1">
          {isLoggedIn && (
            <button
              onClick={onBellClick}
              aria-label="Notifications"
              className="relative flex p-2 text-on-surface-variant"
            >
              <IoNotificationsOutline size={22} aria-hidden="true" />
              {hasUnreadNotifications && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
              )}
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface p-4 shadow-elevation-2 md:hidden"
            >
              <div className="flex items-center justify-between pb-4">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="font-display text-headline-sm font-bold text-primary"
                >
                  {SITE_NAME}
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-2 text-on-surface-variant"
                >
                  <IoCloseOutline size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <NavLinks
                  links={navLinks}
                  pathname={pathname}
                  collapsed={false}
                  onNavigate={() => setDrawerOpen(false)}
                />
              </div>

              <div className="flex flex-col gap-2 border-t border-outline-variant pt-4">
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-error hover:bg-surface-container"
                  >
                    <IoLogOutOutline size={20} aria-hidden="true" />
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-on-surface hover:bg-surface-container"
                    >
                      <IoLogInOutline size={20} aria-hidden="true" />
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-label-md text-on-primary"
                    >
                      <IoPersonAddOutline size={20} aria-hidden="true" />
                      Become a Pro
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-outline-variant bg-surface transition-[width] duration-200 md:flex ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex items-center gap-2 px-4 py-5 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/" className="font-display text-headline-sm font-bold text-primary">
              {SITE_NAME}
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
          >
            {collapsed ? <IoChevronForwardOutline size={16} /> : <IoChevronBackOutline size={16} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks links={navLinks} pathname={pathname} collapsed={collapsed} />
        </div>

        <div className="flex flex-col gap-1 border-t border-outline-variant px-3 py-4">
          {isLoggedIn && (
            <button
              onClick={onBellClick}
              title={collapsed ? "Notifications" : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <IoNotificationsOutline size={20} className="shrink-0" aria-hidden="true" />
              {!collapsed && <span>Notifications</span>}
              {hasUnreadNotifications && (
                <span
                  className={`absolute h-2 w-2 rounded-full bg-error ${collapsed ? "right-2 top-2" : "left-6 top-2"}`}
                  aria-hidden="true"
                />
              )}
            </button>
          )}

          <div className={`flex items-center px-3 py-1.5 ${collapsed ? "justify-center" : "justify-between"}`}>
            {!collapsed && <span className="text-label-md text-on-surface-variant">Theme</span>}
            <ThemeToggle />
          </div>

          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              title={collapsed ? "Logout" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-error hover:bg-surface-container ${
                collapsed ? "justify-center" : ""
              }`}
            >
              <IoLogOutOutline size={20} className="shrink-0" aria-hidden="true" />
              {!collapsed && <span>Logout</span>}
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                title={collapsed ? "Login" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-label-md text-on-surface hover:bg-surface-container ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <IoLogInOutline size={20} className="shrink-0" aria-hidden="true" />
                {!collapsed && <span>Login</span>}
              </Link>
              <Link
                href="/auth/signup"
                title={collapsed ? "Become a Pro" : undefined}
                className={`flex items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-label-md text-on-primary ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                <IoPersonAddOutline size={20} className="shrink-0" aria-hidden="true" />
                {!collapsed && <span>Become a Pro</span>}
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
