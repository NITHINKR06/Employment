"use client";

import { useEffect, useState } from "react";
import { IoSearchOutline, IoArrowForward, IoCalendarOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import Link from "next/link";
import Button from "@/components/Button/Button";
import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import NotificationsPanel from "@/components/Notification/NotificationsPanel";
import { notifications as initialNotifications } from "@/data/notifications";
import { apiFetch } from "@/lib/apiClient";

export default function UserDashboardPage() {
  const [notificationsList, setNotificationsList] = useState(initialNotifications);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch("/auth/me").catch(() => null),
      apiFetch("/bookings").catch(() => null),
      apiFetch("/professionals").catch(() => null),
      apiFetch("/notifications").catch(() => null),
    ]).then(([meBody, bookingsBody, professionalsBody, notifBody]) => {
      if (cancelled) return;
      if (meBody?.success && meBody.data?.user) setUser(meBody.data.user);
      if (bookingsBody?.success && bookingsBody.data?.bookings) setBookings(bookingsBody.data.bookings);
      if (professionalsBody?.success && professionalsBody.data?.professionals) setProfessionals(professionalsBody.data.professionals);
      if (notifBody?.success && notifBody.data) {
        // Map backend notification to frontend UI shape if present
        const liveNotifs = notifBody.data.map((n) => ({
          id: n.id,
          icon: "calendar",
          text: `${n.title}: ${n.message}`,
          timestamp: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
          read: Boolean(n.readAt),
        }));
        if (liveNotifs.length > 0) setNotificationsList(liveNotifs);
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeBookings = bookings.filter((b) => b.status !== "Cancelled").slice(0, 3);
  const recommended = professionals.slice(0, 4);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="container py-10">
      {/* Header Banner */}
      <div className="mb-8 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1 md:p-8">
        <h1 className="font-display text-display-lg text-on-surface">
          Good morning, {firstName}
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Here is an overview of your active bookings and local recommendations.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = "/search";
          }}
          className="mt-6 flex max-w-xl items-center gap-3 rounded-xl border border-outline-variant/80 bg-surface px-4 shadow-sm"
        >
          <IoSearchOutline className="text-xl text-on-surface-variant" aria-hidden="true" />
          <input
            type="text"
            placeholder="What do you need help with today?"
            className="h-12 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
          <button type="submit" aria-label="Search" className="rounded-lg bg-primary p-2 text-on-primary hover:bg-primary-container">
            <IoArrowForward aria-hidden="true" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main 2-column Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Active Bookings Section */}
          <section className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-headline-sm text-on-surface">Active Bookings</h2>
                <p className="text-label-sm text-on-surface-variant">Your upcoming home service appointments</p>
              </div>
              <Link href="/user/bookingStatus" className="text-label-sm font-semibold text-primary hover:underline">
                View all ({bookings.length})
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <p className="py-6 text-center text-body-md text-on-surface-variant">Loading bookings...</p>
              ) : activeBookings.length === 0 ? (
                <p className="py-6 text-center text-body-md text-on-surface-variant">No active bookings found.</p>
              ) : (
                activeBookings.map((booking) => (
                  <BookingSummaryRow key={booking._id} booking={booking} basePath="/user/bookingStatus" />
                ))
              )}
            </div>
          </section>

          {/* Recommended Pros */}
          <section className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-headline-sm text-on-surface">Recommended for You</h2>
                <p className="text-label-sm text-on-surface-variant">Top rated local experts available today</p>
              </div>
              <Link href="/search" className="text-label-sm font-semibold text-primary hover:underline">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isLoading ? (
                <p className="col-span-2 py-6 text-center text-body-md text-on-surface-variant">Loading professionals...</p>
              ) : (
                recommended.map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} variant="compact" />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <NotificationsPanel
              notifications={notificationsList}
              variant="full"
              onClearAll={() => setNotificationsList([])}
            />
          </div>

          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-low p-6 text-center">
            <h3 className="font-display text-headline-sm text-on-surface">Need another service?</h3>
            <p className="mt-1 text-body-md text-on-surface-variant">Find instant verified professionals near you.</p>
            <Button href="/search" className="mt-4 w-full">
              Find a Professional
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
