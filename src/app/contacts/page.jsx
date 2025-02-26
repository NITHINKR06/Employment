'use client';
import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export default function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement form submission logic here
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center p-6 mt-7"
    >
      <div className="max-w-5xl w-full shadow-lg rounded-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        {/* Contact Details Section */}
        <motion.div
          variants={itemVariants}
          className="md:w-1/2 p-10 border-b md:border-b-0 md:border-r border-gray-200"
        >
          <h2 className="text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg mb-6">
            We would love to hear from you. Please fill out the form and our team will reach out shortly.
          </p>
          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <span className="block font-semibold">Phone</span>
              <span className="block">+0123 4567 8910</span>
            </motion.div>
            <motion.div variants={itemVariants}>
              <span className="block font-semibold">Email</span>
              <span className="block">hello@flowbase.com</span>
            </motion.div>
            <motion.div variants={itemVariants}>
              <span className="block font-semibold">Address</span>
              <span className="block">102 Street 2714 Don</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div variants={itemVariants} className="md:w-1/2 p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows="4"
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              ></textarea>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.95, transition: { duration: 0.1 } }}
              className="w-full border border-gray-700 text-gray-700 py-3 rounded-md font-semibold transition duration-300 ease-in-out"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
