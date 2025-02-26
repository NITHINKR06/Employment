'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { data } from '@/data/BookingStauts/data'; // Adjust path as needed
import PaymentsModel from '@/app/auth/payment/page';

export default function Payment({ params: promiseParams }) {
  const { id } = React.use(promiseParams);
  const booking = data.find((booking) => booking._id === id);

  const [showModal, setShowModal] = useState(false);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, when: 'beforeChildren', staggerChildren: 0.2 },
    },
  };

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Button hover variant with a subtle glow effect
  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
      transition: { duration: 0.3, repeat: Infinity, repeatType: 'mirror' },
    },
  };

  if (!booking) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 className="text-4xl font-bold mb-4 text-gray-800" variants={itemVariants}>
          Payment Page
        </motion.h1>
        <motion.p className="text-lg text-gray-600" variants={itemVariants}>
          No booking found for ID: {id}
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div
        className="min-h-screen flex flex-col items-center justify-center p-8  from-blue-100 to-gray-200"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          className="text-6xl font-extrabold text-gray-900 mb-10 drop-shadow-lg"
          variants={itemVariants}
        >
          Payment Portal
        </motion.h1>

        <motion.div
          className="w-full max-w-4xl bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-2xl p-10 border border-gray-200"
          variants={itemVariants}
        >
          <motion.h2
            className="text-4xl font-bold text-gray-800 mb-6 border-b pb-2"
            variants={itemVariants}
          >
            Booking Details
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.p className="text-xl text-gray-700" variants={itemVariants}>
              <span className="font-semibold">ID:</span> {booking._id}
            </motion.p>
            <motion.p className="text-xl text-gray-700" variants={itemVariants}>
              <span className="font-semibold">Name:</span> {booking.name}
            </motion.p>
            <motion.p className="text-xl text-gray-700" variants={itemVariants}>
              <span className="font-semibold">Experience:</span> {booking.experience}{' '}
              {booking.experience > 1 ? 'years' : 'year'}
            </motion.p>
            <motion.p className="text-xl text-gray-700" variants={itemVariants}>
              <span className="font-semibold">Status:</span> {booking.status}
            </motion.p>
            <motion.p className="text-xl text-gray-700" variants={itemVariants}>
              <span className="font-semibold">Rating:</span> {booking.rating} / 5
            </motion.p>
          </div>
        </motion.div>

        <motion.div className="mt-10" variants={itemVariants}>
          <motion.button
            className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105 focus:outline-none"
            onClick={() => setShowModal(true)}
            variants={buttonVariants}
            whileHover="hover"
          >
            Proceed to Payment
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Modal with smooth transition */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="w-full h-[600px] border border-gray-300 rounded-lg overflow-y-auto">
                <PaymentsModel />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
