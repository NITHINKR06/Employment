"use client";

import { usePathname } from "next/navigation";
import TopNavBar from "@/components/Navbar/TopNavBar";
import BottomNavBar from "@/components/Navbar/BottomNavBar";
import Footer from "@/components/Footer/Footer";
import Notify from "@/components/Notification/Notify";

function activeTabFor(pathname) {
  if (pathname.startsWith("/search") || pathname.startsWith("/professionals")) return "search";
  if (pathname.startsWith("/user/bookingStatus") || pathname.startsWith("/employee/bookingStatus")) return "bookings";
  if (pathname.startsWith("/user/settings") || pathname.startsWith("/employee/settings")) return "profile";
  return "home";
}

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const navVariant = pathname.startsWith("/search") ? "search" : "dashboard";

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar variant={navVariant} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <div className="hidden md:block">
        <Footer variant="full" />
      </div>
      <BottomNavBar activeTab={activeTabFor(pathname)} />
      <Notify />
    </div>
  );
}
