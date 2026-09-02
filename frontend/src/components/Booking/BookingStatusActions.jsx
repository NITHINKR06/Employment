"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";
import { apiFetch } from "@/lib/apiClient";

export default function BookingStatusActions({ bookingId, actions, onSuccess }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [error, setError] = useState("");

  const applyStatus = async (status) => {
    setError("");
    setPendingStatus(status);
    try {
      // Cancellation goes through booking-lifecycle so the 24h cutoff policy
      // and mock refund actually apply — a plain status PATCH would skip both.
      const body =
        status === "CANCELLED"
          ? await apiFetch(`/booking-lifecycle/bookings/${bookingId}/cancel`, { method: "POST" })
          : await apiFetch(`/bookings/${bookingId}`, {
              method: "PATCH",
              body: JSON.stringify({ status }),
            });
      if (!body.success || !body.data?.booking) {
        throw new Error(body?.error?.message ?? "Could not update booking");
      }
      router.refresh();
      onSuccess?.(body.data.booking);
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingStatus(null);
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.status}
            variant={action.variant ?? "primary"}
            disabled={pendingStatus !== null}
            onClick={() => applyStatus(action.status)}
          >
            {pendingStatus === action.status ? "Updating..." : action.label}
          </Button>
        ))}
      </div>
      {error && (
        <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
          {error}
        </div>
      )}
    </div>
  );
}
