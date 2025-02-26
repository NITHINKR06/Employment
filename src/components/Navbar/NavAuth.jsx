"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
// import Link from "next/link";


const AuthNavbar = () => {
  const pathname = usePathname();
    const authPages = ["/auth/login"];
  // const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl bg-white shadow-lg rounded-full p-3 z-50">
          <div className="flex items-center justify-between px-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Edzzz
            </Link>
      {/* Navigation Links */}
      <nav className=" md:flex flex-row items-center space-x-8 lg:pr-16">

      {authPages.includes(pathname) ?

        <Link href={'/auth/signup'}>
          <button className="px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none">
            Sign Up
          </button>
        </Link>

        :

        <Link href={'/auth/login'}>
          <button className="px-6 py-2 text-white bg-blue-500 rounded-full hover:bg-blue-700 focus:outline-none">
            Login
          </button>
        </Link>
      }
      </nav>
      </div>
    </header>
  );
};

export default AuthNavbar;
