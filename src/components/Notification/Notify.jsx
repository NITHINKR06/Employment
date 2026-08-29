"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoNotificationsOutline, IoCloseSharp } from "react-icons/io5";
import { notifications as seedNotifications } from "@/data/notifications";
import NotificationsPanel from "./NotificationsPanel";

export default function Notify() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifying, setNotifying] = useState(
    seedNotifications.some((notification) => !notification.read)
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setNotifying(false);
          setSidebarOpen(!sidebarOpen);
        }}
        aria-label="Toggle notifications"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-surface-bright shadow-elevation-2 border border-on-surface/10 flex items-center justify-center text-on-surface hover:text-primary transition-colors"
      >
        {notifying && (
          <span className="absolute -top-0.5 right-0 h-3 w-3 rounded-full bg-primary">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          </span>
        )}
        <IoNotificationsOutline className="text-xl" />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 right-6 z-50"
            onClick={(event) => event.target === event.currentTarget && setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-[90vw] max-w-sm rounded-xl bg-surface-bright shadow-elevation-2 border border-on-surface/10 p-2"
            >
              <div className="flex justify-between items-center px-4 py-2 border-b border-on-surface/10">
                <h3 className="font-serif text-headline-sm text-on-surface">Notifications</h3>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                  aria-label="Close notifications"
                >
                  <IoCloseSharp className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <NotificationsPanel notifications={seedNotifications} variant="compact" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
