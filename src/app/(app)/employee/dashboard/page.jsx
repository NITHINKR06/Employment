'use client';
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { MdOutlineWorkspacePremium, MdOutlineReviews } from 'react-icons/md';
import { IoPersonSharp } from 'react-icons/io5';
import Button from '@/components/Button/Button';
import Rating from '@/components/Rating/Rating';

export default function Profile() {
  const [user, setUser] = useState({
    name: 'ABC',
    email: 'abc@example.com',
    about:
      'A passionate professional with extensive experience in web development, dedicated to building responsive and user-friendly websites.',
    experience:
      'Worked at Company A, Company B, and Company C. Skilled in various programming languages and modern web frameworks.',
    yearsExperience: 5,
    place: 'New York, USA',
    ratings: 4,
    review:
      '"An excellent professional with a keen eye for detail and a deep understanding of modern web technologies."',
    profilePhoto: '/profile.jpg',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(user);

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

  const inputClass =
    'w-full rounded border border-outline-variant bg-white p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary';

  const tabContent = {
    about: isEditing ? (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface mb-2">About</h2>
        <textarea
          className={inputClass}
          rows={4}
          value={editingUser.about}
          onChange={(e) => setEditingUser({ ...editingUser, about: e.target.value })}
        />
      </div>
    ) : (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface mb-2">About</h2>
        <p className="text-body-lg text-on-surface-variant">{user.about}</p>
      </div>
    ),
    experience: isEditing ? (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface mb-2">Experience</h2>
        <textarea
          className={inputClass}
          rows={4}
          value={editingUser.experience}
          onChange={(e) => setEditingUser({ ...editingUser, experience: e.target.value })}
        />
        <div className="mt-4">
          <label className="block text-label-md text-on-surface mb-1">Years of Experience:</label>
          <input
            type="number"
            className="w-24 rounded border border-outline-variant bg-white p-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
        <h2 className="font-display text-headline-sm text-on-surface mb-2">Experience</h2>
        <p className="text-body-lg text-on-surface-variant">{user.experience}</p>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Years of Experience: {user.yearsExperience}
        </p>
      </div>
    ),
    reviews: (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface mb-2">Ratings &amp; Reviews</h2>
        <Rating value={user.ratings} />
        <p className="text-body-lg text-on-surface-variant mt-3">{user.review}</p>
      </div>
    ),
  };

  const tabButtonClass = (tab) =>
    `w-full py-2 px-4 rounded text-label-md text-on-surface text-left flex items-center transition-colors ${
      activeTab === tab ? 'bg-surface-container-high' : 'hover:bg-surface-container-low'
    }`;

  return (
    <div className="container flex flex-col items-center py-10" style={{ perspective: '1000px' }}>
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-elevation-2 md:flex-row"
        style={{ transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)` }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center border-b border-outline-variant p-6 md:w-1/3 md:border-b-0 md:border-r">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-surface-container shadow-elevation-1">
            <Image src={user.profilePhoto} alt="Profile Photo" fill className="object-cover" />
          </div>
          {isEditing ? (
            <>
              <input
                type="text"
                className="mt-4 w-full rounded border border-outline-variant p-2 text-center font-display text-headline-sm text-on-surface"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
              <input
                type="email"
                className="mt-1 w-full rounded border border-outline-variant p-2 text-center text-body-md text-on-surface"
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              />
              <input
                type="text"
                className="mt-1 w-full rounded border border-outline-variant p-2 text-center text-body-md text-on-surface"
                value={editingUser.place}
                onChange={(e) => setEditingUser({ ...editingUser, place: e.target.value })}
              />
            </>
          ) : (
            <>
              <h1 className="mt-4 font-display text-headline-md text-on-surface">{user.name}</h1>
              <p className="mt-1 text-body-md text-on-surface-variant">{user.email}</p>
              <p className="mt-1 text-body-md text-on-surface-variant">{user.place}</p>
            </>
          )}

          <div className="mt-8 w-full space-y-2">
            <button onClick={() => setActiveTab('about')} className={tabButtonClass('about')}>
              <IoPersonSharp className="mr-2" aria-hidden="true" /> About
            </button>
            <button onClick={() => setActiveTab('experience')} className={tabButtonClass('experience')}>
              <MdOutlineWorkspacePremium className="mr-2" aria-hidden="true" /> Experience
            </button>
            <button onClick={() => setActiveTab('reviews')} className={tabButtonClass('reviews')}>
              <MdOutlineReviews className="mr-2" aria-hidden="true" /> Reviews
            </button>
          </div>

          {!isEditing && (
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => {
                setIsEditing(true);
                setEditingUser(user);
              }}
            >
              Update
            </Button>
          )}
        </div>

        <div className="p-6 md:w-2/3">
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

      {isEditing && (
        <Button className="mt-6" onClick={handleSaveProfile}>
          Save Profile
        </Button>
      )}
    </div>
  );
}
