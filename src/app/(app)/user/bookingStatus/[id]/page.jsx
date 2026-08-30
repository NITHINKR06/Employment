import { notFound } from "next/navigation";
import Link from "next/link";
import { IoChevronBack, IoCalendarOutline, IoTimeOutline, IoLocationOutline, IoCallOutline } from "react-icons/io5";
import StatBadge from "@/components/Badge/StatBadge";
import Rating from "@/components/Rating/Rating";
import Button from "@/components/Button/Button";
import { data as bookings } from "@/data/bookings/data";

export function generateStaticParams() {
  return bookings.map((b) => ({ id: b._id }));
}

export default async function BookingDetailPage({ params }) {
  const { id } = await params;
  const booking = bookings.find((b) => b._id === id);

  if (!booking) notFound();

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
          <span className="font-mono text-body-md font-semibold text-on-surface">#BK-{booking._id}0894</span>
        </div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Assigned Professional</span>
          <span className="font-display text-body-md font-bold text-on-surface">{booking.name}</span>
        </div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Professional Rating</span>
          <Rating value={booking.rating} />
        </div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Scheduled Date & Time</span>
          <span className="flex items-center gap-2 text-body-md font-medium text-on-surface">
            <IoCalendarOutline className="text-primary" /> {booking.date} at {booking.time}
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-outline-variant/40 pb-3">
          <span className="text-label-md text-on-surface-variant">Service Address</span>
          <span className="flex items-center gap-1 text-body-md text-on-surface">
            <IoLocationOutline className="text-primary" /> 102 Green Park, Bangalore
          </span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-label-md text-on-surface-variant">Total Amount</span>
          <span className="font-display text-headline-sm font-bold text-primary">$48.50</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {booking.status !== "Cancelled" && (
          <Button variant="secondary">Cancel Booking</Button>
        )}
        <Button href="/auth/payment">Go to Payment Portal</Button>
        <Button variant="secondary" icon={IoCallOutline}>
          Contact Pro
        </Button>
      </div>
    </div>
  );
}
