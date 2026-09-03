import Image from "next/image";
import Link from "next/link";
import { IoFlashOutline } from "react-icons/io5";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Rating from "@/components/Rating/Rating";
import Chip from "@/components/Chip/Chip";
import Button from "@/components/Button/Button";
import FavoriteButton from "@/components/Favorite/FavoriteButton";

function NameLine({ worker, textClass = "text-headline-sm text-on-surface" }) {
  return (
    <span className={`inline-flex items-center gap-1 font-display ${textClass}`}>
      {worker.name}
      {worker.verified && <VerifiedBadge size="sm" />}
    </span>
  );
}

function FullCard({ worker }) {
  return (
    <div className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-elevation-1 transition-shadow hover:shadow-elevation-2">
      <div className="relative h-48 w-full">
        <Image src={worker.avatar || "/profile.jpg"} alt={worker.name} fill className="object-cover" />
        <div className="absolute left-3 top-3">
          <Rating value={worker.rating} count={worker.reviewCount} variant="pill" size="sm" />
        </div>
        <div className="absolute right-3 top-3">
          <FavoriteButton professionalId={worker.id} />
        </div>
      </div>
      <div className="p-5">
        <NameLine worker={worker} />
        <p className="mt-0.5 text-body-md text-on-surface-variant">
          {worker.title} &middot; {worker.yearsExperience} yrs exp
        </p>
        <p className="mt-2 text-label-md font-semibold text-on-surface">${worker.hourlyRate}/hr</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {worker.skills?.slice(0, 2).map((skill) => (
            <Chip key={skill} size="sm">
              {skill}
            </Chip>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1 text-label-sm text-on-surface-variant">
          <IoFlashOutline className="text-primary" aria-hidden="true" />
          {worker.availability}
        </p>
        <Button href={`/professionals/${worker.id}`} variant="secondary" className="mt-4 w-full">
          View Profile
        </Button>
      </div>
    </div>
  );
}

function CompactCard({ worker }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-outline-variant p-3 transition-colors hover:bg-surface-container-low">
      <Link href={`/professionals/${worker.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image src={worker.avatar || "/profile.jpg"} alt={worker.name} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <NameLine worker={worker} textClass="text-label-md text-on-surface" />
          <p className="truncate text-label-sm text-on-surface-variant">{worker.title}</p>
          <Rating value={worker.rating} size="sm" />
        </div>
      </Link>
      <FavoriteButton professionalId={worker.id} className="shrink-0" />
    </div>
  );
}

function SummaryCard({ worker }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
        <Image src={worker.avatar || "/profile.jpg"} alt={worker.name} fill className="object-cover" />
      </div>
      <div className="min-w-0">
        <NameLine worker={worker} textClass="text-label-md text-on-surface" />
        <p className="truncate text-label-sm text-on-surface-variant">{worker.title}</p>
      </div>
    </div>
  );
}

export default function WorkerCard({ worker, variant = "full" }) {
  if (variant === "compact") return <CompactCard worker={worker} />;
  if (variant === "summary") return <SummaryCard worker={worker} />;
  return <FullCard worker={worker} />;
}
