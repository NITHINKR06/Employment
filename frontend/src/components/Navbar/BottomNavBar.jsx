"use client";

import Link from "next/link";
import {
  IoHomeOutline,
  IoSearchOutline,
  IoBriefcaseOutline,
  IoChatbubbleOutline,
  IoPersonOutline,
} from "react-icons/io5";

const TABS = [
  { key: "home", label: "Home", href: "/user/dashboard", icon: IoHomeOutline },
  { key: "search", label: "Search", href: "/search", icon: IoSearchOutline },
  { key: "bookings", label: "Bookings", href: "/user/bookingStatus", icon: IoBriefcaseOutline },
  { key: "chat", label: "Chat", href: "/contacts", icon: IoChatbubbleOutline },
  { key: "profile", label: "Profile", href: "/user/settings", icon: IoPersonOutline },
];

export default function BottomNavBar({ activeTab }) {
  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-outline-variant bg-surface-container-lowest md:hidden">
      <div className="flex items-center justify-around py-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === activeTab;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 text-label-sm ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <Icon size={22} aria-hidden="true" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
