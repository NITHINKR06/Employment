"use client";
import React from "react";
import Link from "next/link";
import { FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const bookings = [
  {
    id: "1",
    name: "ABC",
    job: "Programmer",
    location: "New York, USA",
    experience: "5",
  },
  {
    id: "2",
    name: "No Name",
    job: "No Job mentioned",
    location: "Not mentioned",
    experience: "Updating...",
  },
  {
    id: "3",
    name: "XYZ",
    job: "No Job mentioned",
    location: "Not mentioned",
    experience: "Updating...",
  },
  {
    id: "4",
    name: "No Name",
    job: "No Job mentioned",
    location: "Not mentioned",
    experience: "Updating...",
  },
  {
    id: "5",
    name: "No Name",
    job: "No Job mentioned",
    location: "Not mentioned",
    experience: "Updating...",
  },
  {
    id: "6",
    name: "No Name",
    job: "No Job mentioned",
    location: "Not mentioned",
    experience: "Updating...",
  },
];

export default function BookingStatus() {
  return (
    <div className="min-h-screen font-sans text-base mt-[3cm] px-4 pb-8">
      <main className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="
                bg-white 
                rounded-xl 
                shadow-md 
                p-6 
                aspect-square
                flex flex-col 
                justify-between 
                cursor-pointer 
                hover:shadow-lg 
                hover:bg-gray-50
              "
            >
              {/* Avatar + Info */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4">
                  <FiUser size={28} />
                </div>
                <h3 className="text-2xl font-bold text-black mb-2">
                  {booking.name}
                </h3>
                <p className="text-black mb-2 text-center">
                  {booking.job}
                </p>
                <p className="text-black mb-2 text-center">
                  {booking.location}
                </p>
                <p className="text-black mb-4 text-center">
                  Experience: {booking.experience}
                </p>
              </div>

              {/* "Check Booking" Button */}
              <Link
                href={`/employee/bookingStatus/${booking.id}`}
                className="
                  mt-4 
                  block 
                  text-center 
                  text-white 
                  py-2 
                  px-4 
                  rounded-full 
                  transition 
                  transform 
                  duration-200 
                  bg-[#66609f] 
                  hover:bg-[#4b4673] 
                  hover:scale-105
                "
              >
                Check Booking
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
