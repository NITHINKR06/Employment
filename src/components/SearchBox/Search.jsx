import React from 'react';
import { motion } from 'framer-motion';

export default function Search() {
  // Animation variants for the form
  const formVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  // Animation variants for the submit button
  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: { type: 'spring', stiffness: 300 },
    },
  };

  return (
    <div>
      <motion.form
        className="flex items-center max-w-sm mx-auto"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <label className="sr-only">Search</label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-700 dark:text-gray-700"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"
              />
            </svg>
          </div>
          <motion.input
            type="text"
            id="simple-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full ps-10 p-2.5 dark:bg-gray-100 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-gray-500 dark:focus:border-gray-500"
            placeholder="Search branch name..."
            required
            whileFocus={{ scale: 1.02, transition: { duration: 0.2 } }}
          />
        </div>
        <motion.button
          type="submit"
          className="p-2.5 ms-2 text-sm font-medium text-black bg-gray-100 rounded-lg border border-gray-700 hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-50 dark:hover:bg-gray-100 dark:focus:ring-gray-300"
          variants={buttonVariants}
          whileHover="hover"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          <span className="sr-only">Search</span>
        </motion.button>
      </motion.form>
    </div>
  );
}
