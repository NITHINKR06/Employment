'use client'

import Image from 'next/image';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import img from '../../../public/Google.png';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
    },
  },
};

export default function AboutUs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative h-screen w-screen"
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? {} : containerVariants}
    >
      {/* Content Container */}
      <motion.div
        className="relative z-20 flex flex-col h-full w-full"
        variants={shouldReduceMotion ? {} : containerVariants}
      >
        <motion.div
          className="max-w-screen-lg mx-auto p-8 flex-grow flex flex-col justify-center space-y-12"
          variants={shouldReduceMotion ? {} : containerVariants}
        >
          {/* Header Section */}
          <motion.div
            className="flex flex-col md:flex-row items-center gap-20"
            variants={shouldReduceMotion ? {} : itemVariants}
          >
            <motion.div className="relative w-32 h-32" variants={shouldReduceMotion ? {} : itemVariants}>
              {/* Overlapping Squares */}
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-2xl overflow-hidden"
                variants={shouldReduceMotion ? {} : itemVariants}
                whileHover={{ scale: 1.05, rotate: 10 }}
              >
                <Image
                  src={img}
                  alt="Image for II"
                  layout="fill"
                  objectFit="cover"
                />
              </motion.div>
              <motion.div
                className="absolute top-6 left-6 w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-2xl overflow-hidden -rotate-12"
                variants={shouldReduceMotion ? {} : itemVariants}
                whileHover={{ scale: 1.05, rotate: -10 }}
              >
                <Image
                  src={img}
                  alt="Image for IP"
                  layout="fill"
                  objectFit="cover"
                />
              </motion.div>
            </motion.div>
            <motion.div variants={shouldReduceMotion ? {} : itemVariants}>
              <motion.h1 className="text-3xl font-extrabold text-black">
                Our Story
              </motion.h1>
              <motion.p className="mt-4 text-lg text-gray-800">
                We are dedicated to innovation and excellence. Our team is committed to delivering outstanding service and creating unforgettable experiences.
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.hr className="border-t-2 border-gray-300" variants={shouldReduceMotion ? {} : itemVariants} />

          {/* Mission & Vision Section */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={shouldReduceMotion ? {} : containerVariants}
          >
            {/* Mission Card */}
            <motion.div
              className="flex flex-col items-center p-6 bg-gray-300 bg-opacity-70 rounded-xl shadow-md"
              variants={shouldReduceMotion ? {} : itemVariants}
              whileHover={{ scale: 1.03 }}
            >
              <motion.div
                className="relative w-20 h-20 bg--500 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                variants={shouldReduceMotion ? {} : itemVariants}
              >
                <Image
                  src={img}
                  alt="Image for Mission"
                  layout="fill"
                  objectFit="contain"
                />
              </motion.div>
              <motion.h2 className="mt-4 text-xl font-semibold text-black" variants={shouldReduceMotion ? {} : itemVariants}>
                Our Mission
              </motion.h2>
              <motion.p className="mt-2 text-gray-500 text-center" variants={shouldReduceMotion ? {} : itemVariants}>
                To inspire and innovate, making a positive impact in the world through creative solutions.
              </motion.p>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              className="flex flex-col items-center p-6 bg-gray-300 bg-opacity-70 rounded-xl shadow-md"
              variants={shouldReduceMotion ? {} : itemVariants}
              whileHover={{ scale: 1.03 }}
            >
              <motion.div
                className="relative w-20 h-20 bg--500 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                variants={shouldReduceMotion ? {} : itemVariants}
              >
                <Image
                  src={img}
                  alt="Image for Vision"
                  layout="fill"
                  objectFit="contain"
                />
              </motion.div>
              <motion.h2 className="mt-4 text-xl font-semibold text-black" variants={shouldReduceMotion ? {} : itemVariants}>
                Our Vision
              </motion.h2>
              <motion.p className="mt-2 text-gray-500 text-center" variants={shouldReduceMotion ? {} : itemVariants}>
                To be a leader in our industry, fostering creativity and setting standards of excellence worldwide.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
