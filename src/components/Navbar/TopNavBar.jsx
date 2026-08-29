"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { IoClose, IoReorderThreeOutline, IoMailOutline, IoPersonCircleOutline } from "react-icons/io5";
import { SITE_NAME } from "@/lib/constants";
import Button from "@/components/Button/Button";

const NAV_LINKS = [
  { href: "/search", label: "Find a Professional" },
  { href: "/#services", label: "Services" },
  { href: "/about", label: "How it Works" },
];

export default function TopNavBar({ variant = "marketing" }) {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-6 left-6 right-6 z-50">
      <nav className="max-w-[1440px] mx-auto rounded-full bg-surface-bright/80 backdrop-blur-xl shadow-elevation-2 border border-on-surface/10 px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-headline-sm font-bold text-primary">
          {SITE_NAME}
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-sans text-body-md transition-colors duration-300 pb-1 ${
                pathname === link.href
                  ? "text-primary border-b-2 border-primary"
                  : "text-on-surface hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/auth/signup"
            className="font-sans text-body-md text-on-surface hover:text-primary transition-colors duration-300"
          >
            Become a Pro
          </Link>
          {variant === "dashboard" ? (
            <Link href="/user/settings" className="text-on-surface hover:text-primary transition-colors duration-300">
              <IoPersonCircleOutline className="text-2xl" />
            </Link>
          ) : (
            <Link href="/contacts" className="text-on-surface hover:text-primary transition-colors duration-300">
              <IoMailOutline className="text-xl" />
            </Link>
          )}
          <Button href="/auth/login" variant="secondary" size="md">
            Login
          </Button>
        </div>

        <button
          className="md:hidden text-on-surface"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? <IoClose className="w-7 h-7" /> : <IoReorderThreeOutline className="w-7 h-7" />}
        </button>
      </nav>

      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-[1440px] mx-auto mt-3 rounded-xl bg-surface-bright shadow-elevation-2 border border-on-surface/10 p-6 flex flex-col items-center gap-4"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-body-lg text-on-surface hover:text-primary transition-colors"
                onClick={() => setNavOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button href="/auth/login" variant="primary" size="md">
              Login
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
