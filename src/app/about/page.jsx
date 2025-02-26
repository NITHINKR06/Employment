'use client'

import Image from 'next/image';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import img from '../../../public/Google.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function AboutUs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative mt-20 min-h-screen from-white to-gray-100"
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? {} : containerVariants}
    >
      {/* Hero Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center"
        variants={shouldReduceMotion ? {} : itemVariants}
      >
        <motion.div className="md:w-1/2 mb-8 md:mb-0" variants={shouldReduceMotion ? {} : itemVariants}>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">Our Journey</h1>
          <p className="mt-4 text-lg text-gray-600">
            From humble beginnings to a global impact, our story is built on passion, innovation, and a commitment to excellence.
          </p>
        </motion.div>
        <motion.div className="md:w-1/2 flex justify-center" variants={shouldReduceMotion ? {} : itemVariants}>
          <div className="relative w-64 h-64">
            {/* Background layer */}
            <motion.div
              className="absolute inset-0 bg-blue-500 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            />
            {/* Foreground layer with slight offset */}
            <motion.div
              className="absolute inset-4 bg-red-500 rounded-lg shadow-2xl"
              whileHover={{ scale: 1.05, rotate: 3 }}
            />
            <Image
              src={img}
              alt="Our Journey"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Mission and Vision Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        variants={shouldReduceMotion ? {} : containerVariants}
      >
        <motion.div
          className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
          variants={shouldReduceMotion ? {} : itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative w-16 h-16 mb-4">
            <Image
              src={img}
              alt="Mission"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
          <p className="mt-2 text-gray-600">
            To innovate and inspire, creating solutions that empower communities and drive meaningful change.
          </p>
        </motion.div>
        <motion.div
          className="p-8 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
          variants={shouldReduceMotion ? {} : itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative w-16 h-16 mb-4">
            <Image
              src={img}
              alt="Vision"
              layout="fill"
              objectFit="contain"
              className="rounded-full"
            />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Our Vision</h2>
          <p className="mt-2 text-gray-600">
            To lead with creativity and integrity, setting new standards for excellence in our industry.
          </p>
        </motion.div>
      </motion.section>

      {/* Footer Section */}
      <motion.section
        className="max-w-6xl mx-auto px-4 py-8"
        variants={shouldReduceMotion ? {} : itemVariants}
      >
        <p className="text-center text-gray-500">
          Join us as we explore new horizons and redefine the future.
        </p>
      </motion.section>
    </motion.div>
  );
}
