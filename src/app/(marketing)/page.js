import { IoSearchOutline, IoLocationOutline } from "react-icons/io5";
import Button from "@/components/Button/Button";
import Chip from "@/components/Chip/Chip";

const POPULAR_TAGS = [
  "Fix a leaking pipe",
  "Interior painting",
  "Outlet installation",
  "House cleaning",
];

export default function Home() {
  return (
    <section
      className="relative overflow-hidden pb-32 pt-24"
      style={{
        backgroundImage: "radial-gradient(#e0e3e5 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <div className="container relative z-10 text-center">
        <h1 className="mx-auto max-w-4xl font-display text-display-lg text-on-surface md:text-display-lg-desktop">
          Get the job done. <br className="hidden md:block" />
          <span className="text-primary">By someone you can trust.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-body-lg text-on-surface-variant">
          Connect with highly-rated, verified local professionals for any home project. From a
          quick fix to a major renovation.
        </p>

        <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-2 shadow-elevation-2 md:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-outline-variant bg-surface px-4">
            <IoSearchOutline className="text-on-surface-variant" aria-hidden="true" />
            <input
              type="text"
              placeholder="What work do you need done?"
              className="h-12 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-outline-variant bg-surface px-4">
            <IoLocationOutline className="text-on-surface-variant" aria-hidden="true" />
            <input
              type="text"
              placeholder="Zip code or neighborhood"
              className="h-12 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
          </div>
          <Button href="/search" size="lg" className="whitespace-nowrap">
            Search Pros
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <span className="py-2 text-label-sm text-on-surface-variant">Popular:</span>
          {POPULAR_TAGS.map((tag) => (
            <Chip key={tag} as="a" href={`/search?what=${encodeURIComponent(tag)}`}>
              {tag}
            </Chip>
          ))}
        </div>
      </div>
    </section>
  );
}
