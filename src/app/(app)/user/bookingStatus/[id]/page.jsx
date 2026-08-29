import { notFound } from "next/navigation";
import Image from "next/image";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import Rating from "@/components/Rating/Rating";
import StatBadge from "@/components/Badge/StatBadge";
import Button from "@/components/Button/Button";
import { data as bookings } from "@/data/bookings/data";

export function generateStaticParams() {
  return bookings.map((booking) => ({ id: booking._id }));
}

export default function UserBookingDetailPage({ params }) {
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
              <p className="font-sans text-body-md text-on-surface-variant mt-1">with {booking.name}</p>
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

          <div className="flex items-center gap-2">
            <span className="font-sans text-[13px] text-on-surface-variant">Professional rating:</span>
            <Rating value={booking.rating} />
          </div>

          {booking.status === "Pending" && (
            <Button href="/auth/payment" variant="primary" size="lg" className="w-fit">
              Proceed to Payment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
