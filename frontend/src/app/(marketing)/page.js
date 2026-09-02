import Link from "next/link";
import Image from "next/image";
import {
  IoSearchOutline,
  IoLocationOutline,
  IoShieldCheckmarkOutline,
  IoSparklesOutline,
  IoStar,
  IoChevronForwardOutline,
  IoCheckmarkCircle,
  IoFlashOutline,
} from "react-icons/io5";
import {
  MdOutlineBuild,
  MdOutlineElectricalServices,
  MdOutlineFormatPaint,
  MdOutlineCleaningServices,
  MdOutlineHomeRepairService,
  MdOutlineAcUnit,
  MdOutlineVerifiedUser,
} from "react-icons/md";
import Button from "@/components/Button/Button";
import Chip from "@/components/Chip/Chip";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Rating from "@/components/Rating/Rating";
import { serverApiFetch } from "@/lib/serverApiClient";

const POPULAR_TAGS = [
  "Fix a leaking pipe",
  "Interior painting",
  "Outlet installation",
  "House cleaning",
];

const CATEGORIES = [
  {
    title: "Plumbing",
    icon: MdOutlineBuild,
    count: "45+ Verified Pros",
    tag: "Plumbing",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    title: "Electrical",
    icon: MdOutlineElectricalServices,
    count: "38+ Verified Pros",
    tag: "Electrical",
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    title: "Painting",
    icon: MdOutlineFormatPaint,
    count: "29+ Verified Pros",
    tag: "Painting",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    title: "Cleaning",
    icon: MdOutlineCleaningServices,
    count: "52+ Verified Pros",
    tag: "Cleaning",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    title: "Handyman",
    icon: MdOutlineHomeRepairService,
    count: "40+ Verified Pros",
    tag: "Handyman",
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    title: "HVAC & AC",
    icon: MdOutlineAcUnit,
    count: "22+ Verified Pros",
    tag: "HVAC",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Describe your job",
    desc: "Specify what you need fixed, installed, or renovated in your home.",
  },
  {
    step: "02",
    title: "Compare verified pros",
    desc: "Browse transparent upfront pricing, real ratings, and background checks.",
  },
  {
    step: "03",
    title: "Book & Pay securely",
    desc: "Choose a time slot that fits your schedule. Funds are protected until done.",
  },
];

const TRUST_STATS = [
  { value: "100%", label: "Verified Pros", subtext: "Background & skill checked" },
  { value: "4.9★", label: "Average Rating", subtext: "From thousands of real reviews" },
  { value: "$10M", label: "Protection Coverage", subtext: "Guaranteed satisfaction on all jobs" },
  { value: "< 2 hrs", label: "Avg Response Time", subtext: "Same-day booking available" },
];

export default async function Home() {
  let professionals = [];
  try {
    const body = await serverApiFetch("/professionals");
    professionals = body.data.professionals;
  } catch {
    // Backend unreachable — render the page without featured pros rather than 500.
  }
  const topPros = professionals.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden border-b border-outline-variant/40 bg-surface py-20 lg:py-24"
        style={{
          backgroundImage: "radial-gradient(#e0e3e5 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="container relative z-10 text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-container/10 px-4 py-1.5 text-label-md font-medium text-primary">
            <IoSparklesOutline className="h-4 w-4" />
            <span>Trusted by 10,000+ local homeowners</span>
          </div>

          <h1 className="mx-auto max-w-4xl font-display text-display-lg text-on-surface md:text-display-lg-desktop">
            Get the job done. <br className="hidden md:block" />
            <span className="text-primary">By someone you can trust.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-on-surface-variant">
            Connect with highly-rated, verified local professionals for any home project.
            From quick plumbing fixes to complete interior painting.
          </p>

          {/* Search Bar Container */}
          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-2.5 rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-elevation-2 md:flex-row">
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface px-4 py-1">
              <IoSearchOutline className="text-xl text-on-surface-variant" aria-hidden="true" />
              <input
                type="text"
                placeholder="What work do you need done?"
                className="h-12 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface px-4 py-1">
              <IoLocationOutline className="text-xl text-on-surface-variant" aria-hidden="true" />
              <input
                type="text"
                placeholder="Zip code or neighborhood"
                className="h-12 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              />
            </div>
            <Button href="/search" size="lg" className="whitespace-nowrap rounded-xl shadow-sm">
              Search Pros
            </Button>
          </div>

          {/* Popular Tag Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <span className="py-1 text-label-md font-medium text-on-surface-variant">Popular:</span>
            {POPULAR_TAGS.map((tag) => (
              <Chip key={tag} as="a" href={`/search?what=${encodeURIComponent(tag)}`} className="hover:border-primary/40">
                {tag}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="container">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">Explore Categories</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Find specialized experts for every type of home project
            </p>
          </div>
          <Link
            href="/search"
            className="hidden items-center gap-1 text-label-md font-semibold text-primary hover:underline md:flex"
          >
            All categories <IoChevronForwardOutline />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={`/search?category=${encodeURIComponent(cat.tag)}`}
                className="group flex flex-col items-center rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 text-center shadow-elevation-1 transition-all hover:-translate-y-1 hover:shadow-elevation-2"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${cat.color} transition-transform group-hover:scale-110`}>
                  <Icon className="text-2xl" />
                </div>
                <h3 className="mt-4 font-display text-label-md font-semibold text-on-surface group-hover:text-primary">
                  {cat.title}
                </h3>
                <p className="mt-1 text-label-sm text-on-surface-variant">{cat.count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Professionals Section */}
      <section className="bg-surface-container-low py-16">
        <div className="container">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-label-md font-semibold uppercase tracking-wider text-primary">Top Rated Pros</span>
              <h2 className="mt-1 font-display text-headline-md text-on-surface">
                Hire Verified Local Experts
              </h2>
            </div>
            <Button href="/search" variant="secondary">
              View All Professionals
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topPros.map((worker) => (
              <div
                key={worker.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-elevation-1 transition-all hover:shadow-elevation-2"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                      <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-display text-label-md font-bold text-on-surface">
                          {worker.name}
                        </h3>
                        {worker.verified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">
                        {worker.title} &middot; {worker.yearsExperience} yrs exp
                      </p>
                      <div className="mt-1">
                        <Rating value={worker.rating} count={worker.reviewCount} size="sm" />
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-2 text-body-md text-on-surface-variant">
                    {worker.bio}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {worker.skills?.map((skill) => (
                      <Chip key={skill} size="sm">
                        {skill}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-outline-variant/60 bg-surface-container-low px-6 py-4">
                  <div>
                    <span className="text-label-sm text-on-surface-variant">Rate</span>
                    <p className="font-display text-label-md font-bold text-on-surface">
                      ${worker.hourlyRate}<span className="text-label-sm font-normal text-on-surface-variant">/hr</span>
                    </p>
                  </div>
                  <Button href={`/professionals/${worker.id}`} size="md">
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container">
        <div className="text-center">
          <span className="text-label-md font-semibold uppercase tracking-wider text-primary">Simple Process</span>
          <h2 className="mt-1 font-display text-headline-md text-on-surface">How ProMarket Works</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Three simple steps to getting your home projects completed effortlessly
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((item) => (
            <div
              key={item.step}
              className="relative rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-8 shadow-elevation-1"
            >
              <span className="font-display text-display-lg text-primary/30">{item.step}</span>
              <h3 className="mt-2 font-display text-headline-sm text-on-surface">{item.title}</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Metrics */}
      <section className="bg-surface-container py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {TRUST_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 text-center shadow-elevation-1"
              >
                <p className="font-display text-display-lg font-bold text-primary">{stat.value}</p>
                <p className="mt-1 font-display text-label-md font-bold text-on-surface">{stat.label}</p>
                <p className="mt-1 text-label-sm text-on-surface-variant">{stat.subtext}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="container">
        <div className="relative overflow-hidden rounded-3xl bg-on-surface px-8 py-14 text-surface shadow-elevation-2 md:px-16">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-headline-md font-bold text-surface md:text-display-lg">
              Are you a skilled service professional?
            </h2>
            <p className="mt-4 text-body-lg text-surface-variant">
              Join ProMarket to grow your local business, set your own schedule, and get discovered by clients in your area.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/auth/signup" size="lg" className="bg-primary text-on-primary hover:bg-primary-container">
                Become a Pro Today
              </Button>
              <Button href="/about" variant="secondary" size="lg" className="border-surface-variant text-surface hover:bg-surface/10">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
