"use client";

import { useEffect, useState } from "react";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { apiFetch } from "@/lib/apiClient";

/**
 * Self-contained favorite toggle — checks its own status on mount so it can be
 * dropped into any card (including inside a Server Component parent) without
 * the parent needing to fetch/pass favorite state.
 */
export default function FavoriteButton({ professionalId, className = "" }) {
  const [favorited, setFavorited] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/favorites")
      .then((body) => {
        if (cancelled) return;
        const ids = new Set((body.data?.professionals ?? []).map((p) => p.id));
        setFavorited(ids.has(professionalId));
      })
      .catch(() => {
        // Not logged in or request failed — leave the button in its default state.
      });
    return () => {
      cancelled = true;
    };
  }, [professionalId]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBusy) return;
    setIsBusy(true);
    try {
      const body = await apiFetch(`/favorites/${professionalId}/toggle`, { method: "POST" });
      setFavorited(Boolean(body.data?.favorited));
    } catch (err) {
      if (err.status === 401) {
        window.location.href = "/auth/login";
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isBusy}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-error shadow-sm backdrop-blur transition hover:scale-105 disabled:opacity-60 ${className}`}
    >
      {favorited ? <IoHeart /> : <IoHeartOutline />}
    </button>
  );
}
