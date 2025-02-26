import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';

export default function Search() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  // Animation variants for the form
  const formVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  // Animation variants for the input on focus/blur
  const inputVariants = {
    focused: { scale: 1.02, transition: { duration: 0.2 } },
    blurred: { scale: 1 },
  };

  // Animation variants for the submit button
  const buttonVariants = {
    hover: {
      scale: 1.1,
      transition: { type: 'spring', stiffness: 300 },
    },
  };

  const handleClear = () => setQuery('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle search submission logic here
    console.log('Searching for:', query);
  };

  return (
    <div className="flex justify-center mt-10">
      <motion.form
        className="relative flex items-center w-full max-w-md"
        initial="initial"
        animate="animate"
        variants={formVariants}
        onSubmit={handleSubmit}
      >
        <motion.input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search branch name..."
          className="w-full py-2 pl-10 pr-10 border shadow-md rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          variants={inputVariants}
          animate={focused ? 'focused' : 'blurred'}
          aria-label="Search branch name"
        />
        {/* Search icon on the left */}
        <div className="absolute left-3 pointer-events-none">
          <FaSearch className="text-gray-500" />
        </div>
        {/* Clear button appears when there is text */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Clear search input"
          >
            <FaTimes />
          </button>
        )}
        <motion.button
          type="submit"
          className="absolute right-1 p-2 rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          variants={buttonVariants}
          whileHover="hover"
          aria-label="Submit search"
        >
          <FaSearch />
        </motion.button>
      </motion.form>
    </div>
  );
}

export function SBox() {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <motion.div
      className="hidden md:flex flex-1 mx-6 max-w-lg relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
    >
      <motion.input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full p-3 pl-10 pr-4 text-sm border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        animate={{ scale: focused ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <FaSearch
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all"
      />
    </motion.div>
  );
}