"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IoClose, IoReorderThreeOutline } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

function Navbar () {
  const [navOpen, setNavOpen] = useState(false);
  const handleNavClose = () => setNavOpen(false);

  return (
    <div className="blu">
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl bg-white shadow-lg rounded-full p-3 z-50">
          <div className="flex items-center justify-between px-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Edzzz
            </Link>

            {/* Search Bar (Hidden on mobile) */}
            <div className="hidden md:flex flex-1 mx-6 max-w-lg relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full p-3 pl-10 pr-4 text-sm border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/about" className="text-gray-700 hover:text-blue-500 transition">
                About
              </Link>
              <Link href="/contacts" className="text-gray-700 hover:text-blue-500 transition">
                Contact
              </Link>
              <Link href="/auth/login">
                <button className="px-5 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 transition">
                  Login
                </button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-gray-500 focus:outline-none" onClick={() => setNavOpen(!navOpen)}>
              {navOpen ? <IoClose className="w-7 h-7" /> : <IoReorderThreeOutline className="w-7 h-7" />}
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
                <Link href="/about" className="text-lg font-semibold text-gray-700 hover:text-blue-500 transition" onClick={handleNavClose}>
                  About
                </Link>
                <Link href="/contacts" className="text-lg font-semibold text-gray-700 hover:text-blue-500 transition" onClick={handleNavClose}>
                  Contact
                </Link>
                <Link href="/faq" className="text-lg font-semibold text-gray-700 hover:text-blue-500 transition" onClick={handleNavClose}>
                  FAQ
                </Link>
                <Link href="/support" className="text-lg font-semibold text-gray-700 hover:text-blue-500 transition" onClick={handleNavClose}>
                  Support
                </Link>
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
};

export default Navbar;
