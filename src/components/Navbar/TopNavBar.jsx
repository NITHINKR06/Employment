"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  IoMenuOutline,
  IoCloseOutline,
  IoSearchOutline,
  IoLocationOutline,
  IoNotificationsOutline,
  IoPersonOutline,
} from "react-icons/io5";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";
import { notifications } from "@/data/notifications";

const hasUnreadNotifications = notifications.some((notification) => !notification.read);

const NAV_LINKS = [
  { href: "/search", label: "Categories" },
  { href: "/about", label: "How it Works" },
  { href: "/about", label: "Trust & Safety" },
];

export default function TopNavBar({ variant = "marketing", onBellClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (variant === "minimal") {
    return (
      <header className="w-full bg-transparent">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-headline-md font-bold text-primary">
            {SITE_NAME}
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-surface shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-headline-md font-bold text-primary">
            {SITE_NAME}
          </Link>
          {variant !== "search" && (
            <nav className="hidden items-center gap-8 md:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-label-md text-on-surface-variant transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          {variant === "search" && (
            <div className="hidden max-w-lg flex-1 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 md:flex">
              <IoSearchOutline className="text-on-surface-variant" aria-hidden="true" />
              <input
                type="text"
                placeholder="What work do you need done?"
                className="h-11 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
              <IoLocationOutline className="text-on-surface-variant" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBellClick}
            aria-label="Notifications"
            className="relative flex p-2 text-on-surface-variant transition-colors hover:text-primary"
          >
            <IoNotificationsOutline size={22} aria-hidden="true" />
            {hasUnreadNotifications && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-error" aria-hidden="true" />
            )}
          </button>
          {variant === "dashboard" ? (
            <Link
              href="/user/settings"
              className="hidden h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant md:flex"
              aria-label="Account"
            >
              <IoPersonOutline aria-hidden="true" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden text-label-md text-on-surface-variant transition-colors hover:text-primary md:inline-block"
            >
              Login
            </Link>
          )}
          <Button href="/auth/signup" size="md" className="hidden md:inline-flex">
            Become a Pro
          </Button>
          <button
            className="p-2 text-on-surface-variant md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <IoCloseOutline size={26} /> : <IoMenuOutline size={26} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-outline-variant bg-surface md:hidden"
          >
            <div className="container flex flex-col gap-4 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-label-md text-on-surface"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="text-label-md text-on-surface">
                Login
              </Link>
              <Button href="/auth/signup" size="md">
                Become a Pro
              </Button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
