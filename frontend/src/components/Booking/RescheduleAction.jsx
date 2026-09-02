"use client";

import { useState } from "react";
import Button from "@/components/Button/Button";
import { apiFetch } from "@/lib/apiClient";

function formatSlot(isoString) {
  return new Date(isoString).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RescheduleAction({ bookingId, professionalId, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const open = () => {
    setIsOpen(true);
    setError("");
    setIsLoading(true);
    apiFetch(`/availability/${professionalId}`)
      .then((body) => setSlots(body.data?.slots ?? []))
      .catch(() => setError("Could not load open slots"))
      .finally(() => setIsLoading(false));
  };

  const reschedule = async (slotId) => {
    setError("");
    setIsSubmitting(true);
    try {
      const body = await apiFetch(`/booking-lifecycle/bookings/${bookingId}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ newSlotId: slotId }),
      });
      if (!body.success) {
        throw new Error(body?.error?.message ?? "Could not reschedule");
      }
      setIsOpen(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err.status === 409
          ? "That slot was just booked by someone else — pick another."
          : err.message ?? "Could not reschedule"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={open}>
        Reschedule
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <p className="font-display text-label-md font-semibold text-on-surface">Pick a new time</p>
      {isLoading ? (
        <p className="mt-2 text-body-md text-on-surface-variant">Loading open slots...</p>
      ) : slots.length === 0 ? (
        <p className="mt-2 text-body-md text-on-surface-variant">
          No open slots available right now.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              type="button"
              disabled={isSubmitting}
              onClick={() => reschedule(slot.id)}
              className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface transition hover:bg-surface-container-low disabled:opacity-60"
            >
              {formatSlot(slot.startsAt)}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-label-sm font-semibold text-error">{error}</p>}
      <Button variant="secondary" className="mt-3" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </div>
  );
}
