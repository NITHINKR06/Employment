import { IoSearchOutline, IoArrowForward } from "react-icons/io5";
import Link from "next/link";
import Button from "@/components/Button/Button";
import BookingSummaryRow from "@/components/Booking/BookingSummaryRow";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import NotificationsPanel from "@/components/Notification/NotificationsPanel";
import { data as bookings } from "@/data/bookings/data";
import { professionals } from "@/data/professionals";
import { notifications } from "@/data/notifications";

export default function UserDashboardPage() {
  const activeBookings = bookings.filter((b) => b.status !== "Cancelled").slice(0, 3);
  const recommended = professionals.slice(0, 4);

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="font-display text-display-lg text-on-surface md:text-display-lg-desktop">
          Good morning, Arjun
        </h1>
        <div className="mt-4 flex max-w-xl items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 shadow-elevation-1">
          <IoSearchOutline className="text-on-surface-variant" aria-hidden="true" />
          <input
            type="text"
            placeholder="What work do you need done?"
            className="h-12 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
          />
          <button aria-label="Search" className="text-primary">
            <IoArrowForward aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg bg-surface-container-lowest p-5 shadow-elevation-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-headline-sm text-on-surface">Active Bookings</h2>
              <Link href="/user/bookingStatus" className="text-label-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {activeBookings.map((booking) => (
                <BookingSummaryRow key={booking._id} booking={booking} />
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-surface-container-lowest p-5 shadow-elevation-1">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-headline-sm text-on-surface">Recommended Professionals</h2>
              <Link href="/search" className="text-label-sm text-primary hover:underline">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {recommended.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} variant="compact" />
              ))}
            </div>
          </section>
        </div>

        <div>
          <NotificationsPanel notifications={notifications} variant="full" />
          <Button href="/search" variant="secondary" className="mt-4 w-full">
            Find a Professional
          </Button>
        </div>
      </div>
    </div>
  );
}
