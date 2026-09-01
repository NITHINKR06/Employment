"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { MdOutlineWorkspacePremium, MdOutlineReviews } from "react-icons/md";
import { IoPersonSharp, IoLocationOutline, IoBriefcaseOutline, IoCashOutline, IoCheckmarkDoneOutline, IoTimeOutline } from "react-icons/io5";
import Button from "@/components/Button/Button";
import Rating from "@/components/Rating/Rating";
import TextField from "@/components/TextField/TextField";

const EMPTY_FORM = {
  title: "",
  trade: "",
  yearsExperience: 0,
  hourlyRate: "",
  bio: "",
  location: "",
};

function CreateProfileForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearsExperience: Number(form.yearsExperience) || 0,
          hourlyRate: Number(form.hourlyRate) || 0,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body?.error?.message ?? "Could not create profile");
      }
      onCreated(body.data.professional);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-xl py-10">
      <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 shadow-elevation-1">
        <h1 className="font-display text-headline-md text-on-surface">Set Up Your Professional Profile</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Clients will see this information when they search for a professional.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">{error}</div>
          )}
          <TextField
            placeholder="Job title (e.g. Master Plumber)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <TextField
            placeholder="Trade / category (e.g. Plumbing)"
            value={form.trade}
            onChange={(e) => setForm({ ...form, trade: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              type="number"
              placeholder="Years of experience"
              value={form.yearsExperience}
              onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
            />
            <TextField
              type="number"
              placeholder="Hourly rate ($)"
              value={form.hourlyRate}
              onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
              required
            />
          </div>
          <TextField
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <textarea
            rows={4}
            placeholder="Tell clients about yourself"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating..." : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function EmployeeDashboardPage() {
  const [professional, setProfessional] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadDashboard = () => {
    setIsLoading(true);
    setLoadError("");
    fetch("/api/professionals/me")
      .then((res) => res.json())
      .then(async (body) => {
        if (!body.success) {
          setLoadError(
            body.error?.code === "UNAUTHORIZED"
              ? "Please log in as an employee to see your dashboard."
              : body.error?.message ?? "Could not load dashboard"
          );
          return;
        }
        setProfessional(body.data.professional);
        if (body.data.professional) {
          const [summaryRes, reviewsRes] = await Promise.all([
            fetch("/api/bookings/summary").then((r) => r.json()),
            fetch(`/api/professionals/${body.data.professional.id}/reviews`).then((r) => r.json()),
          ]);
          if (summaryRes.success) setSummary(summaryRes.data.summary);
          if (reviewsRes.success) setReviews(reviewsRes.data.reviews);
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSaveProfile = async () => {
    setSaveError("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/professionals/${professional.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProfessional.title,
          bio: editingProfessional.bio,
          experienceSummary: editingProfessional.experienceSummary,
          yearsExperience: Number(editingProfessional.yearsExperience) || 0,
          location: editingProfessional.location,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body?.error?.message ?? "Could not save profile");
      }
      setProfessional(body.data.professional);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  const inputClass =
    "w-full rounded-lg border border-outline-variant bg-surface p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary";

  const tabButtonClass = (tab) =>
    `w-full py-3 px-4 rounded-lg text-label-md font-semibold text-left flex items-center transition-colors ${
      activeTab === tab
        ? "bg-primary text-on-primary"
        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
    }`;

  if (isLoading) {
    return (
      <div className="container py-20 text-center font-display text-headline-sm text-on-surface-variant">
        Loading dashboard...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container py-20 text-center font-display text-headline-sm text-on-surface-variant">
        {loadError}
      </div>
    );
  }

  if (!professional) {
    return <CreateProfileForm onCreated={() => loadDashboard()} />;
  }

  const tabContent = {
    about: isEditing ? (
      <div className="space-y-4">
        <h2 className="font-display text-headline-sm text-on-surface">About You</h2>
        <textarea
          className={inputClass}
          rows={4}
          value={editingProfessional.bio ?? ""}
          onChange={(e) => setEditingProfessional({ ...editingProfessional, bio: e.target.value })}
        />
      </div>
    ) : (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface">About</h2>
        <p className="mt-3 text-body-lg text-on-surface-variant">{professional.bio || "No bio yet."}</p>
        <div className="mt-6 flex flex-wrap gap-4 text-label-md text-on-surface-variant">
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5">
            <IoLocationOutline className="text-primary" /> {professional.location || "Not set"}
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-1.5">
            <IoBriefcaseOutline className="text-primary" /> {professional.yearsExperience} Years Exp
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
          value={editingProfessional.experienceSummary ?? ""}
          onChange={(e) => setEditingProfessional({ ...editingProfessional, experienceSummary: e.target.value })}
        />
        <div>
          <label className="mb-1 block text-label-md text-on-surface">Years of Experience:</label>
          <input
            type="number"
            className="w-32 rounded-lg border border-outline-variant bg-surface p-2 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            min="0"
            value={editingProfessional.yearsExperience}
            onChange={(e) =>
              setEditingProfessional({
                ...editingProfessional,
                yearsExperience: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>
    ) : (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface">Experience</h2>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          {professional.experienceSummary || "No experience summary yet."}
        </p>
        <div className="mt-4 rounded-xl bg-surface-container-low p-4">
          <p className="font-display text-label-md font-bold text-on-surface">Total Industry Experience</p>
          <p className="text-headline-sm font-bold text-primary">{professional.yearsExperience} Years</p>
        </div>
      </div>
    ),
    reviews: (
      <div>
        <h2 className="font-display text-headline-sm text-on-surface">Client Reviews</h2>
        <div className="mt-3 flex items-center gap-2">
          <Rating value={professional.rating} count={professional.reviewCount} />
        </div>
        <div className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">No reviews yet.</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="rounded-xl bg-surface-container-low p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-label-md font-bold text-on-surface">{rev.author}</span>
                  <Rating value={rev.rating} size="sm" />
                </div>
                {rev.comment && <p className="mt-2 text-body-md text-on-surface-variant">{rev.comment}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    ),
  };

  return (
    <div className="container py-10">
      {summary && (
        <div className="mx-auto mb-6 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 text-center shadow-elevation-1">
            <IoTimeOutline className="mx-auto text-xl text-primary" />
            <p className="mt-1 font-display text-headline-sm text-on-surface">{summary.upcomingJobs}</p>
            <p className="text-label-sm text-on-surface-variant">Upcoming</p>
          </div>
          <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 text-center shadow-elevation-1">
            <IoCheckmarkDoneOutline className="mx-auto text-xl text-primary" />
            <p className="mt-1 font-display text-headline-sm text-on-surface">{summary.completedJobs}</p>
            <p className="text-label-sm text-on-surface-variant">Completed</p>
          </div>
          <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 text-center shadow-elevation-1">
            <IoBriefcaseOutline className="mx-auto text-xl text-primary" />
            <p className="mt-1 font-display text-headline-sm text-on-surface">{summary.totalJobs}</p>
            <p className="text-label-sm text-on-surface-variant">Total Jobs</p>
          </div>
          <div className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 text-center shadow-elevation-1">
            <IoCashOutline className="mx-auto text-xl text-primary" />
            <p className="mt-1 font-display text-headline-sm text-on-surface">${summary.totalEarnings.toFixed(2)}</p>
            <p className="text-label-sm text-on-surface-variant">Earnings</p>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-elevation-2 md:flex-row">
        {/* Left Sidebar Profile Section */}
        <div className="flex flex-col items-center border-b border-outline-variant/60 p-6 md:w-1/3 md:border-b-0 md:border-r">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 shadow-elevation-1">
            <Image src={professional.avatar} alt="Profile Photo" fill className="object-cover" />
          </div>
          <div className="mt-4 text-center">
            <h1 className="font-display text-headline-md text-on-surface">{professional.name}</h1>
            {isEditing ? (
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-outline-variant p-2 text-center text-label-md text-on-surface"
                value={editingProfessional.title}
                onChange={(e) => setEditingProfessional({ ...editingProfessional, title: e.target.value })}
              />
            ) : (
              <p className="text-label-md font-semibold text-primary">{professional.title}</p>
            )}
            <p className="mt-1 text-label-sm text-on-surface-variant">{professional.email}</p>
          </div>

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

          {saveError && (
            <div className="mt-4 w-full rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
              {saveError}
            </div>
          )}

          {!isEditing ? (
            <Button
              variant="secondary"
              className="mt-6 w-full"
              onClick={() => {
                setIsEditing(true);
                setEditingProfessional(professional);
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <Button className="mt-6 w-full" onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Profile"}
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
