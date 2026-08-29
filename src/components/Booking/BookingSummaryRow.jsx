import Image from "next/image";
import Link from "next/link";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import StatBadge from "@/components/Badge/StatBadge";

export default function BookingSummaryRow({ booking }) {
  return (
    <Link
      href={booking.route}
      className="flex items-center gap-4 p-4 rounded-lg border border-on-surface/10 hover:border-primary/40 transition-colors"
    >
      <div className="relative shrink-0 h-14 w-14 rounded-lg overflow-hidden bg-surface-container-high">
        <Image src={booking.thumbnail} alt={booking.serviceTitle} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-sans font-semibold text-on-surface truncate">{booking.serviceTitle}</p>
          <StatBadge status={booking.status} />
        </div>
        <p className="font-sans text-[13px] text-on-surface-variant truncate">{booking.name}</p>
        <div className="flex items-center gap-3 mt-1 text-[12px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1">
            <IoCalendarOutline /> {booking.date}
          </span>
          <span className="inline-flex items-center gap-1">
            <IoTimeOutline /> {booking.time}
          </span>
        </div>
      </div>
    </Link>
  );
}
