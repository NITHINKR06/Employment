"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoChevronBack, IoCalendarOutline, IoLocationOutline, IoCallOutline } from "react-icons/io5";
import StatBadge from "@/components/Badge/StatBadge";
import Rating from "@/components/Rating/Rating";
import Button from "@/components/Button/Button";
import BookingStatusActions from "@/components/Booking/BookingStatusActions";
import BookingReviewForm from "@/components/Booking/BookingReviewForm";
import { apiFetch } from "@/lib/apiClient";

export default function BookingDetailPage() {
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
            ? "Please log in to see this booking."
            : err.status === 403 || err.status === 404
              ? "Booking not found."
              : err.message || "Could not load booking"
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
        <p className="font-display text-headline-sm text-on-surface">Loading booking...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="font-display text-headline-sm text-on-surface">{error || "Booking not found."}</p>
        <Link href="/user/bookingStatus" className="mt-4 inline-block text-label-md font-medium text-primary hover:underline">
          &larr; Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/user/bookingStatus"
        className="mb-4 inline-flex items-center gap-1 text-label-md font-medium text-on-surface-variant hover:text-primary"
      >
        <IoChevronBack /> Back to Bookings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-md text-on-surface">{booking.serviceTitle}</h1>
        <StatBadge status={booking.status} />
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Booking ID</span>
          <span className="font-mono text-body-md font-semibold text-on-surface">#{booking._id}</span>
        </div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Assigned Professional</span>
          <span className="font-display text-body-md font-bold text-on-surface">{booking.name}</span>
        </div>
        {booking.rating != null && (
          <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
            <span className="text-label-md text-on-surface-variant">Professional Rating</span>
            <Rating value={booking.rating} />
          </div>
        )}
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Scheduled Date & Time</span>
          <span className="flex items-center gap-2 text-body-md font-medium text-on-surface">
            <IoCalendarOutline className="text-primary" /> {booking.date ?? "Not scheduled"} {booking.time ? `at ${booking.time}` : ""}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Service Address</span>
          <span className="flex items-center gap-1 text-body-md text-on-surface">
            <IoLocationOutline className="text-primary" /> {booking.address}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-label-md text-on-surface-variant">Total Amount</span>
          <span className="font-display text-headline-sm font-bold text-primary">
            {booking.amount != null ? `$${booking.amount.toFixed(2)}` : "Pending payment"}
          </span>
        </div>
      </div>

      <BookingStatusActions
        bookingId={booking._id}
        onSuccess={load}
        actions={[
          ...(booking.status !== "Cancelled" && booking.status !== "Completed"
            ? [{ status: "CANCELLED", label: "Cancel Booking", variant: "secondary" }]
            : []),
        ]}
      />

      <div className="mt-4 flex flex-wrap gap-3">
        {!booking.amount && booking.status !== "Cancelled" && (
          <Button href={`/auth/payment?bookingId=${booking._id}`}>Go to Payment Portal</Button>
        )}
        <Button variant="secondary" icon={IoCallOutline}>
          Contact Pro
        </Button>
      </div>

      {booking.status === "Completed" && !booking.reviewed && (
        <BookingReviewForm bookingId={booking._id} onSuccess={load} />
      )}
    </div>
  );
}
