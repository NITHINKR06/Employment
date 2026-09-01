import { notFound } from "next/navigation";
import Link from "next/link";
import StatBadge from "@/components/Badge/StatBadge";
import BookingStatusActions from "@/components/Booking/BookingStatusActions";
import { getBookingById } from "@/server/services/booking.service";
import { requireAuth } from "@/server/auth/requireAuth";
import { NotFoundError, ForbiddenError, UnauthorizedError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

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

export default async function EmployeeBookingDetailPage({ params }) {
  const { id } = await params;

  let booking;
  try {
    const user = await requireAuth();
    booking = await getBookingById(user, id);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof UnauthorizedError) {
      notFound();
    }
    throw error;
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

      <BookingStatusActions bookingId={booking._id} actions={STATUS_ACTIONS[booking.status] ?? []} />

      <Link href="/employee/bookingStatus" className="mt-4 inline-block text-label-sm text-primary hover:underline">
        &larr; Back to jobs
      </Link>
    </div>
  );
}
