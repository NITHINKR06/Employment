'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { MdOutlineWorkspacePremium, MdOutlineReviews } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';
import { FaStar } from 'react-icons/fa6';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'Arjun Rao',
    email: 'arjun@example.com',
    about:
      'Twelve years spent solving the leaks, blockages, and installs other plumbers won’t touch. Every job is guaranteed and every fitting is inspected before I leave.',
    experience:
      'Worked across residential and light-commercial plumbing. Licensed, insured, and background checked.',
    yearsExperience: 12,
    place: 'Bangalore, India',
    ratings: 4,
    review:
      '"Arjun found the leak two other plumbers missed. Professional, punctual, and left the kitchen spotless."',
    profilePhoto: '/profile.jpg',
  });

  // isEditing controls whether the fields are editable.
  const [isEditing, setIsEditing] = useState(false);
  // editingUser holds the temporary edits.
  const [editingUser, setEditingUser] = useState(user);

  // Tab selection and 3D tilt effect states.
  const [activeTab, setActiveTab] = useState('about');
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = -((y - centerY) / centerY) * 10;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handleSaveProfile = () => {
    setUser(editingUser);
    setIsEditing(false);
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const fieldClass =
    'minimal-input w-full py-2 font-sans text-body-lg text-on-surface';

  // Render tab content differently depending on whether the fields are editable.
  const tabContent = {
    about: isEditing ? (
      <div>
        <h2 className="font-serif text-headline-sm text-on-surface mb-2">About</h2>
        <textarea
          className={fieldClass}
          rows={4}
          value={editingUser.about}
          onChange={(e) =>
            setEditingUser({ ...editingUser, about: e.target.value })
          }
        />
      </div>
    ) : (
      <div>
        <h2 className="font-serif text-headline-sm text-on-surface mb-2">About</h2>
        <p className="font-sans text-body-lg text-on-surface-variant">{user.about}</p>
      </div>
    ),
    experience: isEditing ? (
      <div>
        <h2 className="font-serif text-headline-sm text-on-surface mb-2">Experience</h2>
        <textarea
          className={fieldClass}
          rows={3}
          value={editingUser.experience}
          onChange={(e) =>
            setEditingUser({ ...editingUser, experience: e.target.value })
          }
        />
        <div className="mt-4">
          <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            className={`${fieldClass} w-24`}
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
        <h2 className="font-serif text-headline-sm text-on-surface mb-2">Experience</h2>
        <p className="font-sans text-body-lg text-on-surface-variant">{user.experience}</p>
        <p className="font-sans text-body-lg text-on-surface-variant mt-2">
          Years of Experience: {user.yearsExperience}
        </p>
      </div>
    ),
    // Ratings & Reviews are now always read-only
    reviews: (
      <div>
        <h2 className="font-serif text-headline-sm text-on-surface mb-2">
          Ratings &amp; Reviews
        </h2>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <FaStar
              key={i}
              className={i < user.ratings ? 'text-primary' : 'text-surface-container-high'}
            />
          ))}
          <span className="ml-2 font-sans text-body-md text-on-surface-variant">({user.ratings}/5)</span>
        </div>
        <p className="font-sans text-body-lg text-on-surface-variant">{user.review}</p>
      </div>
    ),
  };

  return (
    <div
      className="container flex flex-col items-center justify-center pb-section-gap"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-surface-container-lowest rounded-xl shadow-elevation-2 border border-on-surface/10 w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Sidebar */}
        <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-on-surface/10 p-6 flex flex-col items-center">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-elevation-1">
            <Image
              src={user.profilePhoto}
              alt="Profile Photo"
              fill
              className="object-cover"
            />
          </div>
          {isEditing ? (
            <>
              <input
                type="text"
                className={`mt-4 ${fieldClass} text-center`}
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
              />
              <input
                type="email"
                className={`mt-1 ${fieldClass} text-center`}
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />
              <input
                type="text"
                className={`mt-1 ${fieldClass} text-center`}
                value={editingUser.place}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, place: e.target.value })
                }
              />
            </>
          ) : (
            <>
              <h1 className="mt-4 font-serif text-headline-sm text-on-surface">{user.name}</h1>
              <p className="mt-1 font-sans text-body-md text-on-surface-variant">{user.email}</p>
              <p className="mt-1 font-sans text-body-md text-on-surface-variant">{user.place}</p>
            </>
          )}
          <div className="mt-8 w-full flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full py-2 px-4 rounded-lg font-sans text-body-md text-on-surface text-left flex items-center transition-colors ${
                activeTab === 'about' ? 'bg-surface-container' : 'hover:bg-surface-container-low'
              }`}
            >
              <IoPersonSharp className="mr-2 text-lg" /> About
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`w-full py-2 px-4 rounded-lg font-sans text-body-md text-on-surface text-left flex items-center transition-colors ${
                activeTab === 'experience' ? 'bg-surface-container' : 'hover:bg-surface-container-low'
              }`}
            >
              <MdOutlineWorkspacePremium className="mr-2 text-lg" /> Experience
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full py-2 px-4 rounded-lg font-sans text-body-md text-on-surface text-left flex items-center transition-colors ${
                activeTab === 'reviews' ? 'bg-surface-container' : 'hover:bg-surface-container-low'
              }`}
            >
              <MdOutlineReviews className="mr-2 text-lg" /> Reviews
            </button>
          </div>
          {/* Show Update button in the sidebar only when not editing */}
          {!isEditing && (
            <div className="mt-4 w-full">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditingUser(user);
                }}
                className="w-full py-2 px-4 bg-on-surface text-surface font-sans font-semibold uppercase tracking-[0.1em] text-[12px] rounded shadow-elevation-1 hover:bg-on-surface/90 transition-colors"
              >
                Update
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:w-2/3 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (isEditing ? '-editing' : '')}
              variants={tabVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {tabContent[activeTab]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Save Profile button at the bottom when in edit mode */}
      {isEditing && (
        <div className="mt-4">
          <button
            onClick={handleSaveProfile}
            className="py-2 px-6 bg-primary text-on-primary font-sans font-semibold uppercase tracking-[0.1em] text-[12px] rounded shadow-elevation-1 hover:bg-primary-container transition-colors"
          >
            Save Profile
          </button>
        </div>
      )}
    </div>
  );
}
