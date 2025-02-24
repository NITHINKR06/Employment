"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12">
      {/* Signup Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white p-6 sm:p-8 lg:p-10"
      >
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Sign Up
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
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