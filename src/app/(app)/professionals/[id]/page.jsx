import Image from "next/image";
import { notFound } from "next/navigation";
import { IoLocationOutline, IoFlashOutline } from "react-icons/io5";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Rating from "@/components/Rating/Rating";
import Chip from "@/components/Chip/Chip";
import Button from "@/components/Button/Button";
import { getProfessionalById, professionals } from "@/data/professionals";

export function generateStaticParams() {
  return professionals.map((p) => ({ id: p.id }));
}

export default async function ProfessionalProfilePage({ params }) {
  const { id } = await params;
  const worker = getProfessionalById(id);

  if (!worker) notFound();

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="flex items-start gap-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
              <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
            </div>
            <div>
              <h1 className="inline-flex items-center gap-2 font-display text-headline-md text-on-surface">
                {worker.name}
                {worker.verified && <VerifiedBadge size="md" />}
              </h1>
              <p className="mt-1 text-body-md text-on-surface-variant">{worker.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-label-md text-on-surface-variant">
                <Rating value={worker.rating} count={worker.reviewCount} />
                <span>{worker.yearsExperience} yrs experience</span>
                <span className="inline-flex items-center gap-1">
                  <IoLocationOutline aria-hidden="true" /> {worker.location}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-display text-headline-sm text-on-surface">About</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">{worker.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {worker.trustBadges.map((badge) => (
                <Chip key={badge} variant="tertiary">
                  {badge}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-headline-sm text-on-surface">Services Offered</h2>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {worker.servicesOffered.map((service) => (
                <div key={service.title} className="rounded-md border border-outline-variant p-4">
                  <p className="text-label-md font-semibold text-on-surface">{service.title}</p>
                  <p className="mt-1 text-body-md text-on-surface-variant">{service.subtext}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-headline-sm text-on-surface">Portfolio</h2>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {worker.portfolio.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                  <Image src={src} alt={`${worker.name} portfolio ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-lg bg-surface-container-lowest p-6 shadow-elevation-2 lg:sticky lg:top-24">
          <p className="text-body-md text-on-surface-variant">From</p>
          <p className="font-display text-headline-md text-on-surface">${worker.hourlyRate}/hr</p>
          <p className="mt-2 flex items-center gap-1 text-label-sm text-on-surface-variant">
            <IoFlashOutline className="text-primary" aria-hidden="true" /> {worker.availability}
          </p>
          <Button href={`/book/${worker.id}`} className="mt-5 w-full">
            Book Now
          </Button>
          <p className="mt-3 text-label-sm text-on-surface-variant">
            You won&apos;t be charged until the job is confirmed.
          </p>
        </aside>
      </div>
    </div>
  );
}
