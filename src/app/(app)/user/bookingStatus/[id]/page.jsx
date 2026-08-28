import { notFound } from "next/navigation";
import Link from "next/link";
import StatBadge from "@/components/Badge/StatBadge";
import Rating from "@/components/Rating/Rating";
import Button from "@/components/Button/Button";
import { data as bookings } from "@/data/bookings/data";

export default async function BookingDetailPage({ params }) {
  const { id } = await params;
  const booking = bookings.find((b) => b._id === id);

  if (!booking) notFound();

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
          <span className="text-label-md text-on-surface-variant">Professional</span>
          <span className="text-body-md text-on-surface">{booking.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Experience</span>
          <span className="text-body-md text-on-surface">
            {booking.experience} {booking.experience > 1 ? "years" : "year"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Date &amp; Time</span>
          <span className="text-body-md text-on-surface">
            {booking.date} &middot; {booking.time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-md text-on-surface-variant">Rating</span>
          <Rating value={booking.rating} />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {booking.status !== "Cancelled" && (
          <Button variant="secondary">Cancel Booking</Button>
        )}
        <Button href="/auth/payment">Go to Payment</Button>
      </div>

      <Link href="/user/bookingStatus" className="mt-4 inline-block text-label-sm text-primary hover:underline">
        &larr; Back to bookings
      </Link>
    </div>
  );
}
