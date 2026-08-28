"use client";

import { useMemo, useState } from "react";
import FilterPanel from "@/components/Search/FilterPanel";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import { professionals } from "@/data/professionals";

const CATEGORIES = [...new Set(professionals.map((p) => p.trade))];

export default function SearchPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [rateRange, setRateRange] = useState({ min: 0, max: 200 });
  const [sort, setSort] = useState("rating");

  const results = useMemo(() => {
    let list = professionals.filter((worker) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(worker.trade);
      const matchesRate = worker.hourlyRate >= rateRange.min && worker.hourlyRate <= rateRange.max;
      return matchesCategory && matchesRate;
    });

    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "price") list = [...list].sort((a, b) => a.hourlyRate - b.hourlyRate);

    return list;
  }, [selectedCategories, rateRange, sort]);

  return (
    <div className="container py-10">
      <h1 className="font-display text-headline-md text-on-surface">Find a Professional</h1>

      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        <FilterPanel
          categories={CATEGORIES}
          selectedCategories={selectedCategories}
          onCategoryChange={setSelectedCategories}
          rateMin={rateRange.min}
          rateMax={rateRange.max}
          onRateChange={setRateRange}
        />

        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-body-md text-on-surface-variant">
              {results.length} professional{results.length === 1 ? "" : "s"} found
            </p>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded border border-outline-variant bg-white px-3 text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="rating">Sort: Top Rated</option>
              <option value="price">Sort: Price (low to high)</option>
            </select>
          </div>

          {results.length === 0 ? (
            <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
              No professionals match those filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} variant="full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
