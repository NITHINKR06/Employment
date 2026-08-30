"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MdOutlineWorkspacePremium, MdOutlineReviews } from "react-icons/md";
import { IoPersonSharp, IoLocationOutline, IoBriefcaseOutline, IoStarOutline } from "react-icons/io5";
import Button from "@/components/Button/Button";
import Rating from "@/components/Rating/Rating";

export default function EmployeeDashboardPage() {
  const [user, setUser] = useState({
    name: "Arjun Rao",
    title: "Master Plumber",
    email: "arjun.rao@example.com",
    about:
      "Licensed Master Plumber with over 12 years of experience in residential leak repairs, fixture installations, and emergency plumbing solutions across the city.",
    experience:
      "12 years working independently and with certified service firms. Specialized in pipe fitting, water heater installation, and drain cleaning.",
    yearsExperience: 12,
    place: "Bangalore, IN",
    ratings: 4.9,
    reviewCount: 214,
    review:
      '"Arjun provided fantastic service! Solved a persistent leak in our kitchen sink within an hour and left everything spotless. Highly recommended."',
    profilePhoto: "https://ui-avatars.com/api/?name=Arjun+Rao&background=006948&color=fff&size=256&bold=true",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(user);
  const [activeTab, setActiveTab] = useState("about");

  const handleSaveProfile = () => {
    setUser(editingUser);
    setIsEditing(false);
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const inputClass =
    "w-full rounded-lg border border-outline-variant bg-surface p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";

  const tabContent = {
    about: isEditing ? (
      <div className="space-y-4">
        <h2 className="font-display text-headline-sm text-on-surface">About You</h2>
        <textarea
          className={inputClass}
          rows={4}
          value={editingUser.about}
          onChange={(e) => setEditingUser({ ...editingUser, about: e.target.value })}
        />
      </div>
    ) : (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface">About</h2>
        <p className="mt-3 text-body-lg text-on-surface-variant">{user.about}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-label-md text-on-surface-variant">
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5">
            <IoLocationOutline className="text-primary" /> {user.place}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5">
            <IoBriefcaseOutline className="text-primary" /> {user.yearsExperience} Years Exp
          </span>
        </div>
      </div>
    ),
    experience: isEditing ? (
      <div className="space-y-4">
        <h2 className="font-display text-headline-sm text-on-surface">Experience & Skills</h2>
        <textarea
          className={inputClass}
          rows={4}
          value={editingUser.experience}
          onChange={(e) => setEditingUser({ ...editingUser, experience: e.target.value })}
        />
        <div>
          <label className="mb-1 block text-label-md text-on-surface">Years of Experience:</label>
          <input
            type="number"
            className="w-32 rounded-lg border border-outline-variant bg-surface p-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            value={editingUser.yearsExperience}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                yearsExperience: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>
    ) : (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface">Experience</h2>
        <p className="mt-3 text-body-lg text-on-surface-variant">{user.experience}</p>
        <div className="mt-4 rounded-xl bg-surface-container-low p-4">
          <p className="font-display text-label-md font-bold text-on-surface">Total Industry Experience</p>
          <p className="text-headline-sm font-bold text-primary">{user.yearsExperience} Years</p>
        </div>
      </div>
    ),
    reviews: (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface">Client Reviews</h2>
        <div className="mt-3 flex items-center gap-2">
          <Rating value={user.ratings} count={user.reviewCount} />
        </div>
        <p className="mt-4 rounded-xl bg-surface-container-low p-4 italic text-body-lg text-on-surface-variant">
          {user.review}
        </p>
      </div>
    ),
  };

  const tabButtonClass = (tab) =>
    `w-full py-3 px-4 rounded-lg text-label-md font-semibold text-left flex items-center transition-colors ${
      activeTab === tab
        ? "bg-primary text-on-primary"
        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
    }`;

  return (
    <div className="container py-10">
      <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-elevation-2 md:flex-row">
        {/* Left Sidebar Profile Section */}
        <div className="flex flex-col items-center border-b border-outline-variant/60 p-6 md:w-1/3 md:border-b-0 md:border-r">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 shadow-elevation-1">
            <Image src={user.profilePhoto} alt="Profile Photo" fill className="object-cover" />
          </div>
          {isEditing ? (
            <div className="mt-4 w-full space-y-2">
              <input
                type="text"
                className="w-full rounded-lg border border-outline-variant p-2 text-center font-display text-headline-sm text-on-surface"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
              <input
                type="text"
                className="w-full rounded-lg border border-outline-variant p-2 text-center text-label-md text-on-surface"
                value={editingUser.title}
                onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
              />
              <input
                type="email"
                className="w-full rounded-lg border border-outline-variant p-2 text-center text-body-md text-on-surface"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
            </div>
          ) : (
            <div className="mt-4 text-center">
              <h1 className="font-display text-headline-md text-on-surface">{user.name}</h1>
              <p className="text-label-md font-semibold text-primary">{user.title}</p>
              <p className="mt-1 text-label-sm text-on-surface-variant">{user.email}</p>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6 w-full space-y-2">
            <button onClick={() => setActiveTab("about")} className={tabButtonClass("about")}>
              <IoPersonSharp className="mr-2.5 h-5 w-5" aria-hidden="true" /> About
            </button>
            <button onClick={() => setActiveTab("experience")} className={tabButtonClass("experience")}>
              <MdOutlineWorkspacePremium className="mr-2.5 h-5 w-5" aria-hidden="true" /> Experience
            </button>
            <button onClick={() => setActiveTab("reviews")} className={tabButtonClass("reviews")}>
              <MdOutlineReviews className="mr-2.5 h-5 w-5" aria-hidden="true" /> Reviews
            </button>
          </div>

          {!isEditing ? (
            <Button
              variant="secondary"
              className="mt-6 w-full"
              onClick={() => {
                setIsEditing(true);
                setEditingUser(user);
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Button className="mt-6 w-full" onClick={handleSaveProfile}>
              Save Profile
            </Button>
          )}
        </div>

        {/* Right Content Panel */}
        <div className="p-8 md:w-2/3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isEditing ? "-editing" : "")}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
