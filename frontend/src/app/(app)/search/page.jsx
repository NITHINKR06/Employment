"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { IoSearchOutline, IoLocationOutline, IoMapOutline, IoGridOutline, IoChevronBack, IoChevronForward } from "react-icons/io5";
import FilterPanel from "@/components/Search/FilterPanel";
import WorkerCard from "@/components/WorkerCard/WorkerCard";

const ProfessionalsMap = dynamic(() => import("@/components/Search/ProfessionalsMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-2xl border border-outline-variant bg-surface-container-low">
      <p className="text-body-md text-on-surface-variant">Loading map...</p>
    </div>
  ),
});

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialWhat = searchParams.get("what");

  const [professionals, setProfessionals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialWhat || "");
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : []
  );
  const [rateRange, setRateRange] = useState({ min: 0, max: 200 });
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");
  const [isMapView, setIsMapView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch("/api/professionals")
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled && body.success) {
          setProfessionals(body.data.professionals);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(professionals.map((p) => p.trade))],
    [professionals]
  );

  const results = useMemo(() => {
    let list = professionals.filter((worker) => {
      const matchesSearch =
        !searchQuery ||
        worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        worker.skills?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(worker.trade);

      const matchesRate =
        worker.hourlyRate >= rateRange.min && worker.hourlyRate <= rateRange.max;

      const matchesRating = worker.rating >= minRating;

      return matchesSearch && matchesCategory && matchesRate && matchesRating;
    });

    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "price") list = [...list].sort((a, b) => a.hourlyRate - b.hourlyRate);
    if (sort === "experience") list = [...list].sort((a, b) => b.yearsExperience - a.yearsExperience);

    return list;
  }, [professionals, searchQuery, selectedCategories, rateRange, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategories, rateRange, minRating, sort]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedResults = useMemo(
    () => results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [results, currentPage]
  );

  const handleClearAll = () => {
    setSelectedCategories([]);
    setRateRange({ min: 0, max: 200 });
    setMinRating(0);
    setSearchQuery("");
  };

  return (
    <div className="container py-10">
      {/* Top Search Banner */}
      <div className="mb-8 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-elevation-1 md:p-6">
        <h1 className="font-display text-headline-md text-on-surface">Find a Local Professional</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Book background-checked, verified experts with upfront pricing
        </p>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface px-4 py-1">
            <IoSearchOutline className="text-xl text-on-surface-variant" aria-hidden="true" />
            <input
              type="text"
              placeholder="Filter by trade, skill or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
          </div>
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-outline-variant/60 bg-surface px-4 py-1">
            <IoLocationOutline className="text-xl text-on-surface-variant" aria-hidden="true" />
            <input
              type="text"
              placeholder="Bangalore, IN"
              className="h-11 w-full bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Left Sidebar Filter Panel */}
        <FilterPanel
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          rateMin={rateRange.min}
          rateMax={rateRange.max}
          onRateChange={setRateRange}
          minRating={minRating}
          onRatingChange={setMinRating}
          onClearAll={handleClearAll}
        />

        {/* Results Area */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-headline-sm text-on-surface">
                {results.length} Professional{results.length === 1 ? "" : "s"} Available
              </h2>
              <p className="text-label-sm text-on-surface-variant">
                Available for booking today in your area
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Map / Grid View Toggle Button */}
              <button
                onClick={() => setIsMapView(!isMapView)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/80 bg-surface-container-lowest px-3 py-2 text-label-md font-semibold text-on-surface shadow-sm transition hover:bg-surface-container-low"
              >
                {isMapView ? <IoGridOutline /> : <IoMapOutline />}
                <span>{isMapView ? "Grid View" : "Map View"}</span>
              </button>

              {/* Sort Selection Dropdown */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-10 rounded-lg border border-outline-variant/80 bg-surface-container-lowest px-3 text-label-md font-semibold text-on-surface shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="rating">Sort: Top Rated</option>
                <option value="price">Sort: Price (low to high)</option>
                <option value="experience">Sort: Years of Experience</option>
              </select>
            </div>
          </div>

          {/* Render Map View Placeholder or Grid */}
          {isLoading ? (
            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-12 text-center shadow-elevation-1">
              <p className="font-display text-headline-sm text-on-surface">Loading professionals...</p>
            </div>
          ) : isMapView ? (
            <div>
              <ProfessionalsMap professionals={results} />
              {results.some((w) => w.latitude == null || w.longitude == null) && (
                <p className="mt-3 text-label-sm text-on-surface-variant">
                  Some professionals don&apos;t have a pinned location yet and aren&apos;t shown on the map.
                </p>
              )}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-12 text-center shadow-elevation-1">
              <p className="font-display text-headline-sm text-on-surface">No professionals match those filters</p>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Try widening your rate range or selecting a different service category.
              </p>
              <button
                onClick={handleClearAll}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary hover:bg-primary-container"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedResults.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} variant="full" />
              ))}
            </div>
          )}

          {/* Pagination Component */}
          {results.length > 0 && !isMapView && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40"
              >
                <IoChevronBack />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={page === currentPage ? "page" : undefined}
                  className={
                    page === currentPage
                      ? "flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-label-md font-bold text-on-primary"
                      : "flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                  }
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-40"
              >
                <IoChevronForward />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center font-display text-headline-sm text-on-surface-variant">Loading search...</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
