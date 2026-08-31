"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoStar, IoStarOutline } from "react-icons/io5";
import Button from "@/components/Button/Button";

export default function BookingReviewForm({ bookingId }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body?.error?.message ?? "Could not submit review");
      }
      setSubmitted(true);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-3 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1"
    >
      <h2 className="font-display text-headline-sm text-on-surface">Leave a Review</h2>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            aria-label={`Rate ${value} stars`}
            className="text-2xl text-primary"
          >
            {value <= rating ? <IoStar /> : <IoStarOutline />}
          </button>
        ))}
      </div>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was the service?"
        className="w-full rounded border border-outline-variant bg-surface-container-lowest p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {error && (
        <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">{error}</div>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
