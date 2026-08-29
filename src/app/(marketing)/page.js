import Image from "next/image";
import Link from "next/link";
import { FaStar } from "react-icons/fa6";
import { IoFlash } from "react-icons/io5";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";

const CATEGORIES = [
  { title: "Fix my leaking kitchen pipe", cta: "Find Plumber", href: "/search" },
  { title: "Paint my living room", cta: "Find Painter", href: "/search" },
  { title: "Install a new light fixture", cta: "Find Electrician", href: "/search" },
  { title: "General home repairs", cta: "Find Handyman", href: "/search" },
];

const STATS = [
  { value: "100%", label: "Verified Professionals", description: "Every pro undergoes strict background and skill checks." },
  { value: "4.8+", label: "Average Rating", description: "Consistently high-quality service, reviewed by your neighbors." },
  { value: "$10K", label: "Protection Guarantee", description: "Your property is protected against accidental damage." },
  { value: "Local", label: "Community First", description: "Support skilled workers living right in your city." },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-section-gap pb-section-gap">
      <section className="container grid grid-cols-1 md:grid-cols-12 gap-gutter items-center min-h-[70vh]">
        <div className="col-span-1 md:col-span-5 flex flex-col gap-10">
          <h1 className="font-serif text-display-lg-mobile md:text-display-lg text-on-surface">
            There&rsquo;s someone nearby who can get it done.
          </h1>
          <div className="bg-surface-container-lowest p-6 rounded-lg shadow-elevation-2 border border-on-surface/10 flex flex-col gap-6 w-full max-w-md">
            <div className="flex items-center gap-4">
              <span className="text-primary">📍</span>
              <input className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface" placeholder="Location" defaultValue="Bangalore" />
            </div>
            <div className="flex items-center gap-4">
              <input className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface" placeholder="What do you need?" />
            </div>
            <Button href="/search" variant="primary" size="lg" className="w-full">
              Search
            </Button>
          </div>
        </div>

        <div className="col-span-1 md:col-span-6 md:col-start-7 relative h-[500px] hidden md:block">
          <div className="absolute inset-0 rounded-xl overflow-hidden shadow-elevation-1 border border-on-surface/10 bg-surface-container-high">
            <Image src="/banner.webp" alt="A skilled professional at work" fill className="object-cover" />
          </div>
          <div className="absolute top-12 -left-12 bg-surface-container-lowest px-6 py-4 rounded-lg shadow-elevation-2 border border-on-surface/10 flex items-center gap-3">
            <FaStar className="text-primary" />
            <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface">4.9 Verified</span>
          </div>
          <div className="absolute bottom-12 -right-6 bg-surface-container-lowest px-6 py-4 rounded-lg shadow-elevation-2 border border-on-surface/10 flex items-center gap-3">
            <IoFlash className="text-primary" />
            <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface">Available Today</span>
          </div>
        </div>
      </section>

      <section className="container flex flex-col gap-12">
        <h2 className="font-serif text-headline-md text-on-surface">What do you need done?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.title}
              href={category.href}
              className="group relative h-64 rounded-lg overflow-hidden shadow-elevation-1 border border-on-surface/10 bg-surface-container-lowest block"
            >
              <Image
                src="/banner.webp"
                alt={category.title}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-surface-container-lowest to-transparent">
                <h3 className="font-serif text-headline-sm text-on-surface mb-2">{category.title}</h3>
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-primary group-hover:underline">
                  {category.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="py-24 bg-surface-container-low rounded-3xl border border-on-surface/5 grid grid-cols-2 md:grid-cols-4 gap-12 px-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-2 border-l border-on-surface/10 pl-6">
              <div className="font-sans font-light text-numeric-data text-primary">{stat.value}</div>
              <div className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface">{stat.label}</div>
              <p className="font-sans text-body-md text-secondary mt-2">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full bg-inverse-surface text-inverse-on-surface py-32">
        <div className="container grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
          <div className="col-span-1 md:col-span-6 flex flex-col gap-8">
            <h2 className="font-serif text-display-lg-mobile md:text-headline-md">
              Good at something?
              <br />
              Someone nearby needs it.
            </h2>
            <p className="font-sans text-body-lg text-tertiary-fixed-dim max-w-lg">
              Join the {SITE_NAME} network. Set your own hours, name your price, and connect with
              clients who value quality craftsmanship and reliable service.
            </p>
            <div>
              <Button href="/auth/signup" variant="primary" size="lg">
                Become a Professional
              </Button>
            </div>
          </div>
          <div className="col-span-1 md:col-span-5 md:col-start-8 relative h-96 mt-12 md:mt-0">
            <div className="absolute inset-0 rounded-xl overflow-hidden border border-on-surface/10 bg-surface-container-high">
              <Image
                src="/banner.webp"
                alt="A confident tradesperson"
                fill
                className="object-cover grayscale mix-blend-luminosity opacity-80"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
