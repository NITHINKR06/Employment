'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { IoCloseSharp } from "react-icons/io5";
import { usePathname } from 'next/navigation';

export default function Notify() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifying, setNotifying] = useState(true)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Edit your information in a swipe. Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.",
      date: "12 May, 2025",
    },
    {
      id: 2,
      text: "Your profile update was successful.",
      date: "11 May, 2025",
    },
  ])

  const closeSidebar = () => {
    console.log("Close button clicked")
    setSidebarOpen(false)
  }
  

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeSidebar()
    }
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  // Sidebar and backdrop animation variants
  const sidebarVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { x: '0', opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  }

  // Variants for staggered list items
  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  }

  const listItemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  }

  const pathname = usePathname();
  const authPages = ["/auth/login", "/auth/signup", "/auth/resetpassword"];

  if (authPages.includes(pathname)) {
    return null; // Hide footer on auth pages
  }

  return (
    <div>
      {/* Notification Button */}
      <div
        onClick={() => {
          setNotifying(false)
          setSidebarOpen(!sidebarOpen)
        }}
        className="fixed bottom-4 right-4 z-50 bg-gray-300 dark:bg-gray-300 shadow rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow duration-200"
        style={{ width: '58px', height: '58px' }}
      >
        <span
          className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full bg-red-400 ${
            notifying ? 'inline-block' : 'hidden'
          }`}
        >
          <span className="absolute -z-10 inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        </span>
        <svg
          className="fill-current text-gray-800 transition-transform duration-200"
          width="20"
          height="20"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Animated Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 bg-black bg-opacity-40"
            onClick={handleBackdropClick}
          >
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow border border-gray-200 p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-semibold text-gray-800">
                  Notifications {notifications.length ? `(${notifications.length})` : ''}
                </h5>
                <button 
                    onClick={closeSidebar} 
                    className="text-gray-600 hover:text-gray-800 focus:outline-none w-9 h-9 cursor-pointer"
                >
                    <IoCloseSharp className="text-gray-600 w-8 h-8 hover:text-gray-800 focus:outline-none cursor-pointer" />
                </button>

              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="mb-4 text-sm text-blue-600 hover:underline self-end"
                >
                  Clear All
                </button>
              )}
              <motion.ul
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-4 overflow-y-auto flex-1"
              >
                {notifications.map((notification) => (
                  <motion.li
                    key={notification.id}
                    variants={listItemVariants}
                    className="border-t border-gray-200 pt-4"
                  >
                    <Link href="#">
                      <div className="block hover:bg-gray-100 p-2 rounded transition-colors duration-150">
                        <p className="text-sm text-gray-700">
                          {notification.text}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
