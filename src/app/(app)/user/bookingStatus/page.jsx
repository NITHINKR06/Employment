import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import { data as bookings } from "@/data/bookings/data";

export default function UserBookingStatusPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Your Bookings</h1>

      <div className="mt-6 space-y-3">
        {bookings.length === 0 ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
            No bookings found.
          </p>
        ) : (
          bookings.map((booking) => (
            <BookingSummaryRow key={booking._id} booking={booking} basePath="/user/bookingStatus" />
          ))
        )}
      </div>
    </div>
  );
}
