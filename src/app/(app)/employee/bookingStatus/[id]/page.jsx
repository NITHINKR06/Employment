import { notFound } from "next/navigation";
import Image from "next/image";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import StatBadge from "@/components/Badge/StatBadge";
import Button from "@/components/Button/Button";
import { data as bookings } from "@/data/bookings/data";

export function generateStaticParams() {
  return bookings.map((booking) => ({ id: booking._id }));
}

export default function EmployeeBookingDetailPage({ params }) {
  const booking = bookings.find((item) => item._id === params.id);
  if (!booking) notFound();

  return (
    <div className="container max-w-2xl pb-section-gap">
      <div className="rounded-xl border border-on-surface/10 shadow-elevation-1 overflow-hidden">
        <div className="relative h-56 bg-surface-container-high">
          <Image src={booking.thumbnail} alt={booking.serviceTitle} fill className="object-cover" />
        </div>
        <div className="p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-headline-sm text-on-surface">{booking.serviceTitle}</h1>
              <p className="font-sans text-body-md text-on-surface-variant mt-1">
                Client: {booking.name}
              </p>
            </div>
            <StatBadge status={booking.status} />
          </div>

          <div className="flex items-center gap-6 font-sans text-body-md text-on-surface-variant">
            <span className="inline-flex items-center gap-2">
              <IoCalendarOutline /> {booking.date}
            </span>
            <span className="inline-flex items-center gap-2">
              <IoTimeOutline /> {booking.time}
            </span>
          </div>

          {booking.status === "Pending" && (
            <Button variant="primary" size="lg" className="w-fit">
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
