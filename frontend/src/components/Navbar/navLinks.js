import {
  IoGridOutline,
  IoBriefcaseOutline,
  IoHeartOutline,
  IoAlertCircleOutline,
  IoSearchOutline,
  IoSettingsOutline,
  IoCalendarOutline,
  IoCashOutline,
  IoImagesOutline,
  IoStarOutline,
} from "react-icons/io5";

export const GUEST_LINKS = [
  { href: "/search", label: "Categories", icon: IoSearchOutline },
  { href: "/about", label: "How it Works", icon: IoGridOutline },
];

export const USER_LINKS = [
  { href: "/user/dashboard", label: "Dashboard", icon: IoGridOutline },
  { href: "/user/bookingStatus", label: "Bookings", icon: IoBriefcaseOutline },
  { href: "/user/favorites", label: "Favorites", icon: IoHeartOutline },
  { href: "/user/disputes", label: "Reports", icon: IoAlertCircleOutline },
  { href: "/search", label: "Categories", icon: IoSearchOutline },
  { href: "/user/settings", label: "Settings", icon: IoSettingsOutline },
];

export const EMPLOYEE_LINKS = [
  { href: "/employee/dashboard", label: "Dashboard", icon: IoGridOutline },
  { href: "/employee/bookingStatus", label: "Bookings", icon: IoBriefcaseOutline },
  { href: "/employee/availability", label: "Availability", icon: IoCalendarOutline },
  { href: "/employee/earnings", label: "Earnings", icon: IoCashOutline },
  { href: "/employee/portfolio", label: "Portfolio", icon: IoImagesOutline },
  { href: "/employee/reviews", label: "Reviews", icon: IoStarOutline },
  { href: "/search", label: "Categories", icon: IoSearchOutline },
  { href: "/employee/settings", label: "Settings", icon: IoSettingsOutline },
];

export function getNavLinks(user) {
  if (!user) return GUEST_LINKS;
  if (user.role === "EMPLOYEE") return EMPLOYEE_LINKS;
  return USER_LINKS;
}
