"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoClose, IoReorderThreeOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

// Define separate arrays for desktop and mobile if needed
const desktopLinks = [
  { path: "/about", label: "About Us" },
  { path: "/contacts", label: "Contact" },
  { path: "/faq", label: "FAQ" },
  { path: "/user/bookingStatus", label: "Check Status" },
];

const mobileLinks = [
  { path: "/about", label: "About" },
  { path: "/contacts", label: "Contact" },
  { path: "/faq", label: "FAQ" },
  { path: "/support", label: "Support" },
];

function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClose = () => setNavOpen(false);

  return (
    <div className="blu">
      <header className="font-sans fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl bg-white shadow-lg rounded-full p-3 z-50">
        <div className="flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Edzzz
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {desktopLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-gray-700 hover:text-blue-500 transition pb-1 text-lg ${
                  pathname === link.path
                    ? "text-blue-600 font-semibold border-b-2 border-blue-600"
                    : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/auth/login">
              <button className="px-5 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 transition">
                Login
              </button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 focus:outline-none"
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? (
              <IoClose className="w-7 h-7" />
            ) : (
              <IoReorderThreeOutline className="w-7 h-7" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {navOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="absolute top-16 left-0 w-full bg-white rounded-xl shadow-lg p-6 flex flex-col items-center space-y-4"
            >
              {mobileLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-xl font-semibold text-gray-700 hover:text-blue-500 transition pb-1 ${
                    pathname === link.path
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : ""
                  }`}
                  onClick={handleNavClose}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/auth/login">
                <button className="px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 transition focus:outline-none">
                  Login
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}

export default Navbar;
