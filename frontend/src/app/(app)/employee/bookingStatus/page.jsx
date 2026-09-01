import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import { listMyBookings } from "@/server/services/booking.service";
import { requireRole } from "@/server/auth/requireAuth";
import { AppError } from "@/server/utils/errors";

export const dynamic = "force-dynamic";

export default async function EmployeeBookingStatusPage() {
  let bookings = [];
  let accessError = "";
  try {
    const user = await requireRole("EMPLOYEE", "ADMIN");
    bookings = await listMyBookings(user);
  } catch (error) {
    if (error instanceof AppError) {
      accessError =
        error.code === "UNAUTHORIZED"
          ? "Please log in as an employee to see your jobs."
          : "Only employee accounts can view jobs.";
    } else {
      throw error;
    }
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Your Jobs</h1>

      <div className="mt-6 space-y-3">
        {accessError ? (
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
