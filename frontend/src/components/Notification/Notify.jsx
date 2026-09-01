"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoCloseSharp } from "react-icons/io5";
import { notifications as initialNotifications } from "@/data/notifications";
import NotificationsPanel from "./NotificationsPanel";

export default function Notify({ open, onClose }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) onClose();
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
    <AnimatePresence>
      {open && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex justify-end bg-on-surface/20"
          onClick={handleBackdropClick}
        >
          <motion.div
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="relative flex h-full w-full max-w-sm flex-col bg-surface-container-lowest p-4 shadow-elevation-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
              <h2 className="font-display text-headline-sm text-on-surface">Notifications</h2>
              <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
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
  );
}
