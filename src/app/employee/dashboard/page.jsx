'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MdOutlineWorkspacePremium, MdOutlineReviews } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'ABC',
    email: 'abc@example.com',
    about:
      'A passionate professional with extensive experience in web development, dedicated to building responsive and user-friendly websites.',
    experience:
      'Worked at Company A, Company B, and Company C. Skilled in various programming languages and modern web frameworks.',
    yearsExperience: 5, // Added years of experience field
    place: 'New York, USA',
    ratings: 4,
    review:
      '"An excellent professional with a keen eye for detail and a deep understanding of modern web technologies."',
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

  // Render tab content differently depending on whether the fields are editable.
  const tabContent = {
    about: isEditing ? (
      <div>
        <h2 className="text-3xl font-bold text-black mb-2">About</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md text-2xl"
          value={editingUser.about}
          onChange={(e) =>
            setEditingUser({ ...editingUser, about: e.target.value })
          }
        />
      </div>
    ) : (
      <div>
        <h2 className="text-3xl font-bold text-black mb-2">About</h2>
        <p className="text-2xl text-black">{user.about}</p>
      </div>
    ),
    experience: isEditing ? (
      <div>
        <h2 className="text-3xl font-bold text-black mb-2">Experience</h2>
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md text-2xl"
          value={editingUser.experience}
          onChange={(e) =>
            setEditingUser({ ...editingUser, experience: e.target.value })
          }
        />
        <div className="mt-4">
          <label className="block text-2xl text-black mb-1">
            Years of Experience:
          </label>
          <input
            type="number"
            className="w-20 p-2 border border-gray-300 rounded-md text-2xl"
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
        <h2 className="text-3xl font-bold text-black mb-2">Experience</h2>
        <p className="text-2xl text-black">{user.experience}</p>
        <p className="text-2xl text-black mt-2">
          Years of Experience: {user.yearsExperience}
        </p>
      </div>
    ),
    // Ratings & Reviews are now always read-only
    reviews: (
      <div>
        <h2 className="text-3xl font-bold text-black mb-2">
          Ratings & Reviews
        </h2>
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="text-3xl text-yellow-400">
              {i < user.ratings ? '★' : '☆'}
            </span>
          ))}
          <span className="ml-2 text-2xl text-black">({user.ratings}/5)</span>
        </div>
        <p className="text-2xl text-black">{user.review}</p>
      </div>
    ),
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
        style={{
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Sidebar */}
        <div className="md:w-1/3 border-b md:border-b-0 md:border-r border-gray-300 p-6 flex flex-col items-center">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg">
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
                className="mt-4 text-3xl font-bold text-black w-full p-2 border border-gray-300 rounded-md"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
              />
              <input
                type="email"
                className="mt-1 text-2xl text-black w-full p-2 border border-gray-300 rounded-md"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
              />
              <input
                type="text"
                className="mt-1 text-2xl text-black w-full p-2 border border-gray-300 rounded-md"
                value={editingUser.place}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, place: e.target.value })
                }
              />
            </>
          ) : (
            <>
              <h1 className="mt-4 text-4xl font-bold text-black">{user.name}</h1>
              <p className="mt-1 text-2xl text-black">{user.email}</p>
              <p className="mt-1 text-2xl text-black">{user.place}</p>
            </>
          )}
          <div className="mt-8 w-full">
            <button
              onClick={() => setActiveTab('about')}
              className={`w-full py-2 px-4 rounded-lg text-2xl text-black text-left flex items-center transition-transform duration-200 hover:scale-105 ${
                activeTab === 'about' ? 'bg-gray-300' : 'hover:bg-gray-200'
              }`}
            >
              <IoPersonSharp className="mr-2 text-3xl" /> About
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`w-full mt-3 py-2 px-4 rounded-lg text-2xl text-black text-left flex items-center transition-transform duration-200 hover:scale-105 ${
                activeTab === 'experience' ? 'bg-gray-300' : 'hover:bg-gray-200'
              }`}
            >
              <MdOutlineWorkspacePremium className="mr-2 text-3xl" /> Experience
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full mt-3 py-2 px-4 rounded-lg text-2xl text-black text-left flex items-center transition-transform duration-200 hover:scale-105 ${
                activeTab === 'reviews' ? 'bg-gray-300' : 'hover:bg-gray-200'
              }`}
            >
              <MdOutlineReviews className="mr-2 text-3xl" /> Reviews
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
                className="w-full py-2 px-4 bg-gray-600 text-2xl text-white rounded-lg shadow-md transition-transform duration-200 hover:bg-gray-700 hover:scale-105"
              >
                Update
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:w-2/3 p-6">
          <AnimatePresence exitBeforeEnter>
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
            className="py-2 px-6 bg-green-500 text-2xl text-white rounded-lg shadow-md transition-transform duration-200 hover:bg-green-600 hover:scale-105"
          >
            Save Profile
          </button>
        </div>
      )}
    </div>
  );
}
