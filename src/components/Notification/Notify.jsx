"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoCloseSharp, IoNotificationsOutline } from "react-icons/io5";
import { notifications as initialNotifications } from "@/data/notifications";
import NotificationsPanel from "./NotificationsPanel";

export default function Notify() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [notifications, setNotifications] = useState(initialNotifications);

  const closeSidebar = () => setSidebarOpen(false);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) closeSidebar();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const sidebarVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { x: "0", opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  };

  return (
    <div>
      <button
        onClick={() => {
          setNotifying(false);
          setSidebarOpen((open) => !open);
        }}
        aria-label="Open notifications"
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-elevation-2 transition-shadow hover:shadow-elevation-2"
      >
        <span
          className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full bg-error ${
            notifying ? "inline-block" : "hidden"
          }`}
        >
          <span className="absolute -z-10 inline-flex h-full w-full animate-ping rounded-full bg-error opacity-75" />
        </span>
        <IoNotificationsOutline size={22} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-20 right-4 z-50 flex h-[50%] w-[90vw] max-w-sm justify-end rounded-3xl bg-on-surface/10"
            onClick={handleBackdropClick}
          >
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="relative flex h-full w-full flex-col rounded-3xl border border-outline-variant bg-surface-container-lowest p-4 shadow-elevation-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
                <h2 className="font-display text-headline-sm text-on-surface">Notifications</h2>
                <button onClick={closeSidebar} className="text-on-surface-variant hover:text-on-surface">
                  <IoCloseSharp className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NotificationsPanel
                  notifications={notifications}
                  variant="compact"
                  onClearAll={() => setNotifications([])}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
