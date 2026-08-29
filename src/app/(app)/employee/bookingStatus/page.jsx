import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import { data as bookings } from "@/data/bookings/data";

export default function EmployeeBookingStatusPage() {
  return (
    <div className="container max-w-3xl pb-section-gap">
      <h1 className="font-serif text-headline-md text-on-surface mb-8">Booking Requests</h1>
      <div className="flex flex-col gap-3">
        {bookings.map((booking) => (
          <BookingSummaryRow
            key={booking._id}
            booking={{ ...booking, route: `/employee/bookingStatus/${booking._id}` }}
          />
        ))}
      </div>
    </div>
  );
}
