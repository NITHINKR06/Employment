"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatBadge from "@/components/Badge/StatBadge";
import BookingStatusActions from "@/components/Booking/BookingStatusActions";
import { apiFetch } from "@/lib/apiClient";

const STATUS_ACTIONS = {
  Pending: [
    { status: "CONFIRMED", label: "Accept Job" },
    { status: "CANCELLED", label: "Decline", variant: "secondary" },
  ],
  Confirmed: [
    { status: "IN_PROGRESS", label: "Start Job" },
    { status: "CANCELLED", label: "Cancel", variant: "secondary" },
  ],
  "In Progress": [{ status: "COMPLETED", label: "Mark Completed" }],
  Completed: [],
  Cancelled: [],
};

export default function EmployeeBookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setIsLoading(true);
    return apiFetch(`/bookings/${id}`)
      .then((body) => {
        if (body.success && body.data?.booking) {
          setBooking(body.data.booking);
          setError("");
        }
      })
      .catch((err) => {
        setError(
          err.status === 401
            ? "Please log in to see this job."
            : err.status === 403 || err.status === 404
              ? "Job not found."
              : err.message || "Could not load job"
        );
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="font-display text-headline-sm text-on-surface">Loading job...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="font-display text-headline-sm text-on-surface">{error || "Job not found."}</p>
        <Link href="/employee/bookingStatus" className="mt-4 inline-block text-label-sm text-primary hover:underline">
          &larr; Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">{booking.serviceTitle}</h1>

      <div className="mt-6 space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Status</span>
          <StatBadge status={booking.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Booking ID</span>
          <span className="text-body-md text-on-surface">{booking._id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Client</span>
          <span className="text-body-md text-on-surface">{booking.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Date &amp; Time</span>
          <span className="text-body-md text-on-surface">
            {booking.date ?? "Not scheduled"} {booking.time ? `· ${booking.time}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Address</span>
          <span className="text-body-md text-on-surface">{booking.address}</span>
        </div>
      </div>

      <BookingStatusActions
        bookingId={booking._id}
        actions={STATUS_ACTIONS[booking.status] ?? []}
        onSuccess={load}
      />

      <Link href="/employee/bookingStatus" className="mt-4 inline-block text-label-sm text-primary hover:underline">
        &larr; Back to jobs
      </Link>
    </div>
  );
}
