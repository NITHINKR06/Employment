"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import img from "../../../../public/Google.png";
import Image from "next/image";

const cardAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.1 } // Fast, nearly instant animation
  },
};

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log("Signing up with:", username, email, password);
    // Implement signup logic here
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-12">
      {/* Signup Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white p-6 sm:p-8 lg:p-10"
      >
        <div className="flex justify-center mb-6">
          <Image src={img} alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Sign Up
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Username Field */}
          <div className="relative">
            <FiUser
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <FiMail
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Password Field */}
          <div className="relative">
            <FiLock
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <FiLock
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 focus:outline-none"
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={cardAnimation}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-100"
          >
            Sign Up
          </motion.button>
        </form>
      </motion.div>

      {/* Bottom Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg mt-6 shadow-lg rounded-xl border border-gray-200 bg-white py-4 text-center"
      >
        <p className="text-base text-gray-700">
          Have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-semibold hover:underline text-base"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
