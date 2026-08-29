"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IoHomeOutline,
  IoSearchOutline,
  IoCalendarOutline,
  IoChatbubbleOutline,
  IoPersonOutline,
} from "react-icons/io5";

const TABS = [
  { key: "home", href: "/user/dashboard", label: "Home", icon: IoHomeOutline },
  { key: "search", href: "/search", label: "Explore", icon: IoSearchOutline },
  { key: "bookings", href: "/user/bookingStatus", label: "Bookings", icon: IoCalendarOutline },
  { key: "chat", href: "/user/settings", label: "Messages", icon: IoChatbubbleOutline },
  { key: "profile", href: "/user/settings", label: "Profile", icon: IoPersonOutline },
];

export default function BottomNavBar({ activeTab }) {
  const pathname = usePathname();
  const currentTab = activeTab ?? TABS.find((tab) => pathname.startsWith(tab.href))?.key ?? "home";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-5 pb-6 pt-3 rounded-t-full bg-surface-bright shadow-elevation-1 border-t border-on-surface/5">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === currentTab;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`flex flex-col items-center justify-center p-3 transition-colors ${
              isActive
                ? "bg-primary-container text-on-primary-container rounded-full"
                : "text-secondary hover:text-primary"
            }`}
          >
            <Icon className="text-lg mb-1" />
            <span className="font-sans text-[10px] uppercase tracking-[0.1em]">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
