"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiMail, FiHash, FiLock } from "react-icons/fi";
import { TbPasswordMobilePhone } from "react-icons/tb";
import img from "../../../../public/Google.png";


const cardAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.1 }, // Fast, nearly instant animation
  },
};

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // Single OTP input
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log(
      "Reset password for email:",
      email,
      "OTP:",
      otp,
      "New Password:",
      newPassword
    );
    // Implement your reset password functionality here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50">
      {/* Reset Password Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white p-6 sm:p-8 lg:p-10"
      >
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Trouble logging in?
        </h2>
        <p className="text-center text-gray-700 mb-4">
          Enter your email and the received OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <FiMail
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Send OTP Link */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline"
            >
              Send OTP
            </button>
          </div>

          {/* OTP Field as a Single Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <div className="relative">
              <TbPasswordMobilePhone
                size={20}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 pl-10 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                required
              />
            </div>
          </div>

          {/* New Password Field */}
          <div className="relative">
            <FiLock
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <FiLock
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              required
            />
          </div>

          {/* Reset Password Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            variants={cardAnimation}
            className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-100"
          >
            Reset Password
          </motion.button>

          {/* Create New Account Link */}
          <div className="text-center text-gray-700 mt-4">
            <Link
              href="/auth/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Create new account
            </Link>
          </div>
        </form>
      </motion.div>

      {/* Back to Login Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg mt-6 shadow-lg rounded-xl border border-gray-200 bg-white py-4 text-center"
      >
        <Link
          href="/auth/login"
          className="text-blue-600 font-semibold hover:underline text-base"
        >
          Back to Login
        </Link>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
