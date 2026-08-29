import Image from "next/image";
import { notFound } from "next/navigation";
import {
  MdOutlineBathtub,
  MdOutlineWaterDrop,
  MdOutlineHotTub,
  MdOutlinePlumbing,
  MdOutlineHandyman,
} from "react-icons/md";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Rating from "@/components/Rating/Rating";
import Chip from "@/components/Chip/Chip";
import Button from "@/components/Button/Button";
import { professionals, getProfessionalById } from "@/data/professionals";

const SERVICE_ICONS = {
  water_drop: MdOutlineWaterDrop,
  bathtub: MdOutlineBathtub,
  plumbing: MdOutlinePlumbing,
  hot_tub: MdOutlineHotTub,
  handyman: MdOutlineHandyman,
};

export function generateStaticParams() {
  return professionals.map((professional) => ({ id: professional.id }));
}

export default function ProfessionalProfilePage({ params }) {
  const worker = getProfessionalById(params.id);
  if (!worker) notFound();

  return (
    <div className="flex flex-col">
      <div className="relative h-[420px] w-full bg-surface-container-high">
        <Image src={worker.photo} alt={worker.name} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
      </div>

      <div className="container -mt-24 relative z-10">
        <div className="flex items-end gap-6">
          <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-surface bg-surface-container-high shrink-0">
            <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
            {worker.verified && <VerifiedBadge variant="pin" />}
          </div>
          <div className="pb-2">
            <h1 className="font-serif text-headline-md text-on-surface">{worker.name}</h1>
            <div className="flex items-center gap-2 mt-2 font-sans text-body-md text-on-surface-variant">
              <span>{worker.title}</span>
              <span className="text-outline">|</span>
              <Rating value={worker.rating} count={worker.reviewCount} />
              <span className="text-outline">|</span>
              <span>{worker.location}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mt-16 pb-section-gap">
          <div className="md:col-span-8 flex flex-col gap-12">
            <section>
              <h2 className="font-serif text-headline-sm text-on-surface mb-4">The Craft</h2>
              <p className="font-sans text-body-lg text-on-surface-variant">{worker.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {worker.trustBadges.map((badge) => (
                  <Chip key={badge}>{badge}</Chip>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-headline-sm text-on-surface mb-4">Areas of Expertise</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {worker.servicesOffered.map((service) => {
                  const Icon = SERVICE_ICONS[service.icon] ?? MdOutlineHandyman;
                  return (
                    <div
                      key={service.title}
                      className="flex items-start gap-4 p-5 rounded-xl border border-on-surface/10 hover:border-primary/40 transition-colors"
                    >
                      <Icon className="text-2xl text-primary shrink-0" />
                      <div>
                        <h3 className="font-sans font-semibold text-on-surface">{service.title}</h3>
                        <p className="font-sans text-[14px] text-on-surface-variant mt-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {worker.portfolio.length > 0 && (
              <section>
                <h2 className="font-serif text-headline-sm text-on-surface mb-4">Portfolio</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {worker.portfolio.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative h-40 rounded-xl overflow-hidden bg-surface-container-high"
                    >
                      <Image src={image} alt={`${worker.name} portfolio ${index + 1}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="md:col-span-4">
            <div className="sticky top-32 rounded-xl border border-on-surface/10 shadow-elevation-1 p-6 flex flex-col gap-4">
              <p className="font-sans font-light text-numeric-data text-primary">${worker.hourlyRate}/hr</p>
              <p className="font-sans text-[13px] text-on-surface-variant">{worker.availability}</p>
              <Button href={`/book/${worker.id}`} variant="primary" size="lg" className="w-full">
                Book {worker.name.split(" ")[0]}
              </Button>
              <p className="font-sans text-[12px] text-on-surface-variant">
                You won&rsquo;t be charged until the job is confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
