"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";

export default function BookingStatusActions({ bookingId, actions }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [error, setError] = useState("");

  const applyStatus = async (status) => {
    setError("");
    setPendingStatus(status);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) {
        throw new Error(body?.error?.message ?? "Could not update booking");
      }
      router.refresh();
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
