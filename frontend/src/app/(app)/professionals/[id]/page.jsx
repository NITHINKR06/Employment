import Image from "next/image";
import { notFound } from "next/navigation";
import {
  IoLocationOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoBriefcaseOutline,
  IoStar,
  IoCheckmarkCircle,
} from "react-icons/io5";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Rating from "@/components/Rating/Rating";
import Chip from "@/components/Chip/Chip";
import Button from "@/components/Button/Button";
import FavoriteButton from "@/components/Favorite/FavoriteButton";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import { serverApiFetch, ApiNotFoundError } from "@/lib/serverApiClient";

export async function generateStaticParams() {
  try {
    const body = await serverApiFetch("/professionals");
    return body.data.professionals.map((p) => ({ id: p.id }));
  } catch {
    // Backend unreachable at build time — fall back to on-demand rendering.
    return [];
  }
}

export default async function ProfessionalProfilePage({ params }) {
  const { id } = await params;

  let worker;
  try {
    const body = await serverApiFetch(`/professionals/${id}`);
    worker = body.data.professional;
  } catch (error) {
    if (error instanceof ApiNotFoundError) notFound();
    throw error;
  }

  const reviewsBody = await serverApiFetch(`/professionals/${id}/reviews`);
  const reviews = reviewsBody.data.reviews;

  let similar = [];
  try {
    const similarBody = await serverApiFetch(`/professionals/${id}/similar`);
    similar = similarBody.data.professionals;
  } catch {
    // Non-critical section — render the page without it rather than 500.
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Left Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Profile Header Banner */}
          <div className="flex flex-col gap-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1 sm:flex-row sm:items-start">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-primary/20 shadow-elevation-1">
              <Image src={worker.avatar || "/profile.jpg"} alt={worker.name} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-display-lg text-on-surface">
                  {worker.name}
                </h1>
                {worker.verified && <VerifiedBadge size="md" />}
                <FavoriteButton professionalId={worker.id} className="ml-1" />
              </div>
              <p className="mt-1 font-display text-label-md font-semibold text-on-surface-variant">
                {worker.title}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-label-md text-on-surface-variant">
                <Rating value={worker.rating} count={worker.reviewCount} />
                <span className="flex items-center gap-1">
                  <IoBriefcaseOutline className="text-primary" /> {worker.yearsExperience} yrs experience
                </span>
                <span className="flex items-center gap-1">
                  <IoLocationOutline className="text-primary" /> {worker.location}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {worker.trustBadges?.map((badge) => (
                  <Chip key={badge} variant="tertiary">
                    ✓ {badge}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <h2 className="font-display text-headline-sm text-on-surface">About {worker.name}</h2>
            <p className="mt-3 text-body-md leading-relaxed text-on-surface-variant">{worker.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {worker.skills?.map((skill) => (
                <Chip key={skill} variant="default">
                  {skill}
                </Chip>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <h2 className="font-display text-headline-sm text-on-surface">Services Offered</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {worker.servicesOffered.map((service) => (
                <div
                  key={service.title}
                  className="group flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 transition-all hover:border-primary/40 hover:bg-surface-container-lowest shadow-sm"
                >
                  <div>
                    <p className="font-display text-label-md font-semibold text-on-surface group-hover:text-primary">
                      {service.title}
                    </p>
                    <p className="mt-1 text-body-md text-on-surface-variant">{service.subtext}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-outline-variant/40 pt-3 text-label-sm">
                    <span className="font-bold text-primary">Starting at ${worker.hourlyRate}</span>
                    <Button href={`/book/${worker.id}`} size="md" variant="secondary">
                      Select Service
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <h2 className="font-display text-headline-sm text-on-surface">Recent Portfolio</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {worker.portfolio.map((src, i) => (
                <div key={i} className="group relative aspect-video overflow-hidden rounded-xl border border-outline-variant/60 shadow-sm">
                  <Image
                    src={src}
                    alt={`${worker.name} portfolio ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-on-surface/20 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          {/* Reviews Breakdown */}
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-headline-sm text-on-surface">Client Reviews ({worker.reviewCount})</h2>
              <Rating value={worker.rating} />
            </div>

            <div className="mt-6 space-y-4">
              {reviews.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">
                  No reviews yet. Be the first to book and leave feedback.
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-outline-variant/40 pb-4 last:border-none last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-label-md font-bold text-on-surface">{rev.author}</span>
                      <span className="text-label-sm text-on-surface-variant">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Rating value={rev.rating} size="sm" />
                    </div>
                    {rev.comment && <p className="mt-2 text-body-md text-on-surface-variant">{rev.comment}</p>}
                    {rev.professionalResponse && (
                      <div className="mt-3 rounded-lg bg-surface-container-low p-3 text-body-md text-on-surface-variant">
                        <p className="text-label-sm font-semibold text-on-surface">
                          Response from {worker.name}
                        </p>
                        <p className="mt-1">{rev.professionalResponse}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Similar Professionals */}
          {similar.length > 0 && (
            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
              <h2 className="font-display text-headline-sm text-on-surface">You may also like</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {similar.map((s) => (
                  <WorkerCard key={s.id} worker={s} variant="full" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Box */}
        <aside className="h-fit space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-2 lg:sticky lg:top-24">
          <div>
            <span className="text-label-sm font-medium uppercase text-on-surface-variant">Hourly Rate</span>
            <p className="font-display text-display-lg text-on-surface">${worker.hourlyRate}<span className="text-body-md font-normal text-on-surface-variant">/hr</span></p>
          </div>

          <div className="rounded-xl bg-primary-container/10 p-3.5 text-label-md text-on-surface">
            <p className="flex items-center gap-1.5 font-semibold text-primary">
              <IoFlashOutline aria-hidden="true" /> {worker.availability}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">Next available slot today at 2:00 PM</p>
          </div>

          <Button href={`/book/${worker.id}`} className="mt-4 w-full text-center text-label-md">
            Book Appointment Now
          </Button>

          <div className="space-y-2 border-t border-outline-variant/60 pt-4 text-label-sm text-on-surface-variant">
            <p className="flex items-center gap-2">
              <IoShieldCheckmarkOutline className="text-primary text-base" /> 100% Satisfaction Guaranteed
            </p>
            <p className="flex items-center gap-2">
              <IoCheckmarkCircle className="text-primary text-base" /> You won&apos;t be charged until job completion
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
