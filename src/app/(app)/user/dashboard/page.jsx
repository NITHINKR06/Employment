import { IoSearchOutline, IoArrowForward } from "react-icons/io5";
import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import NotificationsPanel from "@/components/Notification/NotificationsPanel";
import { data as bookings } from "@/data/bookings/data";
import { professionals } from "@/data/professionals";
import { notifications } from "@/data/notifications";

export default function UserDashboard() {
  const activeBookings = bookings.filter((booking) => booking.status !== "Cancelled");
  const recommended = professionals.slice(0, 4);

  return (
    <div className="container flex flex-col gap-12">
      <div className="flex flex-col gap-6">
        <h1 className="font-serif text-display-lg-mobile md:text-headline-md text-on-surface">
          Good morning, Arjun.
        </h1>
        <div className="flex items-center gap-4 bg-surface-container-lowest rounded-lg shadow-elevation-1 border border-on-surface/10 px-6 py-4 max-w-xl">
          <IoSearchOutline className="text-on-surface-variant" />
          <input
            className="minimal-input w-full py-1 font-sans text-body-lg text-on-surface"
            placeholder="What do you need done today?"
          />
          <button aria-label="Search" className="text-primary">
            <IoArrowForward className="text-xl" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-headline-sm text-on-surface">Active Bookings</h2>
            <div className="flex flex-col gap-3">
              {activeBookings.map((booking) => (
                <BookingSummaryRow key={booking._id} booking={booking} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-headline-sm text-on-surface">Recommended Professionals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommended.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} variant="compact" />
              ))}
            </div>
          </section>
        </div>

        <div>
          <NotificationsPanel notifications={notifications} variant="full" />
        </div>
      </div>
    </div>
  );
}
