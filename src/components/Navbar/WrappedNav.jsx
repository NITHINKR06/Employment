"use client"; // Mark this as a Client Component

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import AuthNavbar from "./NavAuth";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const authPages = ["/auth/login", "/auth/signup", "/auth/resetpassword"];

  return authPages.includes(pathname) ? <AuthNavbar /> : <Navbar />;
}
