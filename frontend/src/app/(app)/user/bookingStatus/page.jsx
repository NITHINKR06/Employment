"use client";

import { useEffect, useState } from "react";
import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";

const STATUS_TABS = ["All", "Confirmed", "Pending", "Cancelled"];

export default function UserBookingStatusPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (!body.success) {
          setError(
            body.error?.code === "UNAUTHORIZED"
              ? "Please log in to see your bookings."
              : body.error?.message ?? "Could not load bookings"
          );
          return;
        }
        setBookings(body.data.bookings);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "All") return true;
    return b.status === activeTab;
  });

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Your Bookings</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Track the status of all your upcoming and past home appointments
      </p>

      {/* Filter Tabs */}
      <div className="mt-6 flex border-b border-outline-variant/60">
        {STATUS_TABS.map((tab) => {
          const count =
            tab === "All" ? bookings.length : bookings.filter((b) => b.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-label-md font-semibold transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab}
              <span className={`rounded-full px-2 py-0.5 text-label-sm ${
                activeTab === tab ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-on-surface-variant"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
            <p className="font-display text-headline-sm text-on-surface">Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
            <p className="font-display text-headline-sm text-on-surface">{error}</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 text-center">
            <p className="font-display text-headline-sm text-on-surface">No {activeTab.toLowerCase()} bookings found</p>
            <p className="mt-1 text-body-md text-on-surface-variant">When you book a service, it will appear here.</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <BookingSummaryRow key={booking._id} booking={booking} basePath="/user/bookingStatus" />
          ))
        )}
      </div>
    </div>
  );
}
