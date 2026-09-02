"use client";

import { useEffect, useState } from "react";
import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import { apiFetch } from "@/lib/apiClient";

export default function EmployeeBookingStatusPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessError, setAccessError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/bookings")
      .then((body) => {
        if (cancelled) return;
        if (body.success && body.data?.bookings) {
          setBookings(body.data.bookings);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setAccessError(
          err.status === 401
            ? "Please log in as an employee to see your jobs."
            : err.status === 403
              ? "Only employee accounts can view jobs."
              : err.message || "Could not load jobs"
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
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Your Jobs</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
            Loading jobs...
          </p>
        ) : accessError ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
            {accessError}
          </p>
        ) : bookings.length === 0 ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
            No jobs found.
          </p>
        ) : (
          bookings.map((booking) => (
            <BookingSummaryRow key={booking._id} booking={booking} basePath="/employee/bookingStatus" />
          ))
        )}
      </div>
    </div>
  );
}
