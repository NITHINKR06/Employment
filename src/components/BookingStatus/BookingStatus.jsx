'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function BookingStatus() {
  // Dummy data with only the required fields.
  const dummyBookings = [
    {
      _id: '1',
      name: 'John Doe',
      experience: 5,
      status: 'Confirmed',
      rating: 4,
      route: '/user/bookingStatus/{id}',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      experience: 8,
      status: 'Pending',
      rating: 5,
      route: '/',
    },
    {
      _id: '3',
      name: 'Alice Johnson',
      experience: 3,
      status: 'Cancelled',
      rating: 3,
      route: '/',
    },
    {
      _id: '4',
      name: 'John Doe',
      experience: 5,
      status: 'Confirmed',
      rating: 4,
      route: '/',
    },
    {
      _id: '5',
      name: 'Jane Smith',
      experience: 8,
      status: 'Pending',
      rating: 5,
      route: '/',
    },
    {
      _id: '6',
      name: 'Alice Johnson',
      experience: 3,
      status: 'Cancelled',
      rating: 3,
      route: '/',
    },
  ];

  const [bookings] = useState(dummyBookings);
  const [hoveredBookingId, setHoveredBookingId] = useState(null);

  // Container variants for staggered appearance.
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  // Card variants with a subtle entrance and hover effect.
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9, rotate: -3 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotate: 0,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300 },
    },
  };

  // Button variants for a light scaling effect.
  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: { type: 'spring', stiffness: 300 },
    },
  };

  // Tooltip variants for a smooth fade/scale animation.
  const tooltipVariants = {
    hidden: { opacity: 0, y: 5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: 5, scale: 0.95, transition: { duration: 0.2 } },
  };

  // Function to render star icons for rating.
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <svg
            key={i}
            className="w-5 h-5 text-yellow-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.356-2.44a1 1 0 00-1.175 0l-3.356 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.075 9.382c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.955z" />
          </svg>
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="w-5 h-5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.364 1.118l1.287 3.955c.3.921-.755 1.688-1.54 1.118l-3.356-2.44a1 1 0 00-1.175 0l-3.356 2.44c-.784.57-1.838-.197-1.539-1.118l1.287-3.955a1 1 0 00-.364-1.118L2.075 9.382c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.955z" />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {bookings.length === 0 ? (
          <motion.p
            className="col-span-full text-center text-gray-800 font-bold text-xl py-5 px-8 bg-gradient-to-r rounded-xl shadow-xl transition-transform duration-300 hover:scale-95"
            variants={cardVariants}
          >
            No bookings found. Try refreshing the page.
          </motion.p>
        ) : (
          bookings.map((booking) => (
            <motion.div
              key={booking._id}
              className="w-72 bg-white border border-gray-200 rounded-xl shadow-md p-6 relative"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.h5
                className="text-xl font-semibold text-gray-900 mb-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {booking.name}
              </motion.h5>
              <motion.p
                className="text-sm text-gray-700 mb-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                Experience:{' '}
                <strong>
                  {booking.experience} year{booking.experience > 1 ? 's' : ''}
                </strong>
              </motion.p>
              <motion.p
                className="text-sm text-gray-700 mb-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                Status: <strong>{booking.status}</strong>
              </motion.p>
              <motion.div
                className="flex items-center space-x-1 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {renderStars(booking.rating)}
              </motion.div>
              <div className="flex space-x-4 relative">
                <motion.button
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-400 rounded-full shadow-lg focus:outline-none"
                  variants={buttonVariants}
                  // whileHover="hover"
                >
                  Cancel
                </motion.button>
                <div className="relative flex-1">
                  <motion.button
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-gray-300 to-gray-400 rounded-full shadow-lg focus:outline-none"
                    variants={buttonVariants}
                    // whileHover="hover"
                    onHoverStart={() => setHoveredBookingId(booking._id)}
                    onHoverEnd={() => setHoveredBookingId(null)}
                  >
                    <Link href={`/user/bookingStatus/${booking._id}`}>
                      Payment
                    </Link>
                  </motion.button>
                  <AnimatePresence>
                    {hoveredBookingId === booking._id && (
                      <motion.div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3"
                        variants={tooltipVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        <div
                          className={`relative px-4 py-2 rounded-lg shadow-lg text-xs font-medium ${
                            booking.status === 'Pending'
                              ? 'bg-red-500'
                              : 'bg-green-500'
                          } text-white`}
                        >
                          {booking.status === 'Pending'
                            ? 'Payment is pending'
                            : `Payment done with ID: ${booking._id}`}
                          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-current rotate-45" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
