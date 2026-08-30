import Image from "next/image";
import Link from "next/link";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import StatBadge from "@/components/Badge/StatBadge";
import Rating from "@/components/Rating/Rating";

export default function BookingSummaryRow({ booking, basePath = "/user/bookingStatus" }) {
  return (
    <Link
      href={`${basePath}/${booking._id}`}
      className="flex items-center gap-4 rounded-md border border-outline-variant p-4 transition-colors hover:bg-surface-container-low"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md">
        <Image src={booking.thumbnail} alt="" fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-display text-label-md font-semibold text-on-surface">
            {booking.serviceTitle}
          </p>
          <StatBadge status={booking.status} />
        </div>
        <p className="mt-0.5 truncate text-label-sm text-on-surface-variant">{booking.name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-label-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <IoCalendarOutline aria-hidden="true" /> {booking.date}
          </span>
          <span className="inline-flex items-center gap-1">
            <IoTimeOutline aria-hidden="true" /> {booking.time}
          </span>
          <Rating value={booking.rating} size="sm" />
        </div>
      </div>
    </Link>
  );
}
