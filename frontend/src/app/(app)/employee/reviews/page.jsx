"use client";

import { useCallback, useEffect, useState } from "react";
import Button from "@/components/Button/Button";
import Rating from "@/components/Rating/Rating";
import { apiFetch } from "@/lib/apiClient";

function ReplyForm({ reviewId, onSuccess }) {
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const body = await apiFetch(`/reviews/${reviewId}/response`, {
        method: "POST",
        body: JSON.stringify({ response }),
      });
      if (!body.success) {
        throw new Error(body?.error?.message ?? "Could not submit response");
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        rows={2}
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write a public response to this review..."
        className="w-full rounded border border-outline-variant bg-surface p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {error && <p className="text-label-sm font-semibold text-error">{error}</p>}
      <Button type="submit" size="md" disabled={isSubmitting || !response.trim()}>
        {isSubmitting ? "Posting..." : "Post Response"}
      </Button>
    </form>
  );
}

export default function EmployeeReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    return apiFetch("/professionals/me")
      .then(async (body) => {
        const pro = body.data?.professional;
        if (!pro) {
          setError("Create your professional profile first.");
          return;
        }
        const reviewsBody = await apiFetch(`/professionals/${pro.id}/reviews`);
        setReviews(reviewsBody.data?.reviews ?? []);
        setError("");
      })
      .catch((err) => {
        setError(err.status === 401 ? "Please log in as a professional." : "Could not load reviews.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Your Reviews</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Respond publicly to feedback from your clients.
      </p>

      <div className="mt-6 space-y-4">
        {isLoading ? (
          <p className="text-body-md text-on-surface-variant">Loading reviews...</p>
        ) : error ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
            {error}
          </p>
        ) : reviews.length === 0 ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
            No reviews yet.
          </p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-label-md font-bold text-on-surface">
                  {review.author}
                </span>
                <Rating value={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="mt-2 text-body-md text-on-surface-variant">{review.comment}</p>
              )}
              {review.professionalResponse ? (
                <div className="mt-3 rounded-lg bg-surface-container-low p-3 text-body-md text-on-surface-variant">
                  <p className="text-label-sm font-semibold text-on-surface">Your response</p>
                  <p className="mt-1">{review.professionalResponse}</p>
                </div>
              ) : (
                <ReplyForm reviewId={review.id} onSuccess={load} />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
