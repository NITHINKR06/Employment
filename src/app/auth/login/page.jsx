"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const cardAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.1 } // Fast, nearly instant animation
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    // Implement login logic here
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 lg:p-12">
      {/* Login Card */}
      <motion.div 
        initial="hidden" 
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white"
      >
        <div className="p-6">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
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
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-100"
            >
              Log in
            </button>
            <div className="flex justify-end text-base text-gray-500 mt-2">
              <Link href="/auth/resetpassword" className="hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </motion.div>

      {/* Sign up Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg mt-6 shadow-lg rounded-xl border border-gray-200 bg-white py-4 text-center"
      >
        <span className="text-base text-gray-700 mr-1">
          Don't have an account?
        </span>
        <Link
          href="/auth/signup"
          className="text-blue-600 font-semibold hover:underline text-base"
        >
          Sign up
        </Link>
      </motion.div>
    </div>
  );
}