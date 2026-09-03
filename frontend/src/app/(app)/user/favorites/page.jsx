"use client";

import { useEffect, useState } from "react";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import { apiFetch } from "@/lib/apiClient";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/favorites")
      .then((body) => {
        if (cancelled) return;
        if (body.success && body.data?.professionals) {
          setFavorites(body.data.professionals);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err.status === 401
            ? "Please log in to see your favorites."
            : err.message || "Could not load favorites"
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container max-w-5xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Your Favorites</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Professionals you've saved for later
      </p>

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-12 text-center shadow-elevation-1">
            <p className="font-display text-headline-sm text-on-surface">Loading favorites...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-12 text-center shadow-elevation-1">
            <p className="font-display text-headline-sm text-on-surface">{error}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-12 text-center shadow-elevation-1">
            <p className="font-display text-headline-sm text-on-surface">No favorites yet</p>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Tap the heart icon on any professional to save them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} variant="full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
