"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import img from "../../../../public/Google.png";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password);
    // Implement login logic here
  };

  return (
    <div className="min-h w-full flex flex-col items-center justify-center p-6 lg:p-12 bg-gray-50">
      {/* Login Card */}
      <motion.div 
        initial="hidden" 
        animate="visible"
        variants={cardAnimation}
        className="w-full max-w-md lg:max-w-lg shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white"
      >
        <div className="p-8">
          {/* Logo Section */}
          <div className="flex justify-center mb-8">
            <Image src={img} alt="Logo" className="h-16 w-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
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
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            {/* Password Field with Toggle */}
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
                className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-150"
            >
              Log in
            </button>
            <div className="flex justify-end text-base text-gray-500">
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
