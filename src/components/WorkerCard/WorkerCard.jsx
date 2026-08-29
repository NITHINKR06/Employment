import Image from "next/image";
import Link from "next/link";
import { IoHeartOutline } from "react-icons/io5";
import Chip from "@/components/Chip/Chip";
import Rating from "@/components/Rating/Rating";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Button from "@/components/Button/Button";

function CompactWorkerCard({ worker }) {
  return (
    <Link
      href={`/professionals/${worker.id}`}
      className="flex items-center gap-4 p-4 rounded-lg border border-on-surface/10 hover:border-primary/40 transition-colors"
    >
      <div className="relative shrink-0 h-14 w-14 rounded-full overflow-hidden bg-surface-container-high">
        <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
        {worker.verified && <VerifiedBadge variant="pin" size="sm" />}
      </div>
      <div className="min-w-0">
        <p className="font-sans font-semibold text-on-surface truncate">{worker.name}</p>
        <p className="font-sans text-[13px] text-on-surface-variant truncate">{worker.title}</p>
        <Rating value={worker.rating} size="sm" className="mt-1" />
      </div>
    </Link>
  );
}

function SummaryWorkerCard({ worker }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0 h-12 w-12 rounded-full overflow-hidden bg-surface-container-high">
        <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-sans font-semibold text-on-surface truncate">{worker.name}</p>
          {worker.verified && <VerifiedBadge size="sm" />}
        </div>
        <p className="font-sans text-[12px] text-on-surface-variant truncate">{worker.title}</p>
      </div>
      <Rating value={worker.rating} size="sm" className="ml-auto shrink-0" />
    </div>
  );
}

function FullWorkerCard({ worker }) {
  return (
    <div className="group flex flex-col rounded-xl overflow-hidden border border-on-surface/10 bg-surface-container-lowest shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
      <Link href={`/professionals/${worker.id}`} className="relative h-56 block bg-surface-container-high">
        <Image src={worker.photo} alt={worker.name} fill className="object-cover" />
        <button
          type="button"
          aria-label="Save professional"
          className="absolute top-4 right-4 flex items-center justify-center h-9 w-9 rounded-full bg-surface-bright/80 backdrop-blur-xl text-on-surface"
        >
          <IoHeartOutline />
        </button>
        <span className="absolute bottom-4 left-4 rounded-lg bg-surface-bright/80 backdrop-blur-xl px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-primary">
          {worker.title}
        </span>
      </Link>
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link href={`/professionals/${worker.id}`}>
              <h3 className="font-serif text-headline-sm text-on-surface hover:text-primary transition-colors">
                {worker.name}
              </h3>
            </Link>
            <p className="font-sans text-[13px] text-on-surface-variant">{worker.location}</p>
          </div>
          <Rating variant="pill" value={worker.rating} count={worker.reviewCount} size="sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {worker.skills.map((skill) => (
            <Chip key={skill} size="sm">
              {skill}
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="font-sans font-light text-numeric-data text-primary">${worker.hourlyRate}</p>
            <p className="font-sans text-[12px] text-on-surface-variant">{worker.availability}</p>
          </div>
          <Button href={`/professionals/${worker.id}`} variant="secondary" size="md">
            View Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WorkerCard({ worker, variant = "full" }) {
  if (variant === "compact") return <CompactWorkerCard worker={worker} />;
  if (variant === "summary") return <SummaryWorkerCard worker={worker} />;
  return <FullWorkerCard worker={worker} />;
}
