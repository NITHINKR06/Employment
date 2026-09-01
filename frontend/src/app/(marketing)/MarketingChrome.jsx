"use client";

import { useState } from "react";
import TopNavBar from "@/components/Navbar/TopNavBar";
import Footer from "@/components/Footer/Footer";
import Notify from "@/components/Notification/Notify";

export default function MarketingChrome({ children }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <TopNavBar variant="marketing" onBellClick={() => setNotifOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer variant="full" />
      <Notify open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
