"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import { FaSearch } from "react-icons/fa";
import { IoReorderThreeOutline } from "react-icons/io5";

const Navbar = () => {
  const [navOpen, setNavOpen] = useState(false);
  const handleNavClose = () => {
    console.log("Profile saved:");
    setNavOpen(false);
  };

  return (
    <header className="flex mt-1 items-center justify-between p-4 bg-white border border-gray-200 shadow-lg rounded-3xl   mx-4">
      {/* Logo */}
      <div className="text-2xl font-extrabold text-blue-600 lg:pl-16">
        <Link href="/">

        Edzzz
        </Link>
        </div>

      {/* Search Bar (Hidden on small screens) */}
      <div className="relative hidden sm:block w-full max-w-lg mx-4 md:mx-auto">
        <input
          type="text"
          id="search-input"
          placeholder="Search for courses, topics, or resources..."
          className="w-full p-3 pl-12 pr-12 text-sm border  rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
          aria-label="Search icon"
        >
          <FaSearch className="w-5 h-5" />
        </button>
        <button
          className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 focus:outline-none"
          // onClick={() => {
          //   const input = document.getElementById("search-input") as HTMLInputElement;
          //   if (input) input.value = ""; // Clear the input
          // }}
          aria-label="Clear search"
        >
          <IoClose className="w-6 h-6 text-blue-500" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex flex-row items-center space-x-8 pr-16">
        <Link href="/about" className="text-gray-700 hover:text-blue-500 text-lg font-semibold">
          About
        </Link>
        <Link href="/contacts" className="text-gray-700 hover:text-blue-500 text-lg font-semibold">
          Contact
        </Link>
        <Link href={'/auth/login'}>
          <button className="px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none">
            Login
          </button>
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      {/* Search Icon and Mobile Menu Button */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-blue-500 focus:outline-none sm:hidden">
          <FaSearch className="w-6 h-6" />
        </button>
        <button
          className="flex items-center justify-center w-12 h-12 text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none md:hidden"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? <IoClose className="w-6 h-6"/> : <IoReorderThreeOutline className="w-6 h-6"/>}
        </button>
      </div>

      {/* Mobile Navigation */}
      {navOpen && (
        <div className="fixed inset-0 z-10 flex justify-center items-center bg-white bg-opacity-95">
          <div className="w-80 bg-white rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute top-4 right-4 w-8 h-8 text-white bg-slate-400 rounded-full hover:bg-slate-400 focus:outline-none"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation"
            >
              <IoClose className="w-8 h-8" />
            </button>
            <nav className="flex flex-col items-center space-y-4">
              <Link href="/about" className="text-gray-700 hover:text-blue-500 text-lg font-semibold" onClick={handleNavClose}>
                About
              </Link>
              <Link href="/contacts" className="text-gray-700 hover:text-blue-500 text-lg font-semibold" onClick={handleNavClose}>
                Contact
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-500 text-lg font-semibold" onClick={handleNavClose}>
                FAQ
              </Link>
              <Link href="#" className="text-gray-700 hover:text-blue-500 text-lg font-semibold" onClick={handleNavClose}>
                Support
              </Link>
              <button className="px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none" onClick={handleNavClose}>
                Sign Up
              </button>
            </nav>
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;