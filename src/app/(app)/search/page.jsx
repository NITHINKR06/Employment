"use client";

import { useMemo, useState } from "react";
import FilterPanel from "@/components/Search/FilterPanel";
import WorkerCard from "@/components/WorkerCard/WorkerCard";
import { professionals } from "@/data/professionals";

const CATEGORIES = ["Plumbing", "Painting", "Electrical", "Handyman"];

export default function SearchPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [rateMin, setRateMin] = useState(0);
  const [rateMax, setRateMax] = useState(200);
  const [minRating, setMinRating] = useState(0);

  const toggleCategory = (category) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category]
    );
  };

  const results = useMemo(() => {
    return professionals.filter((worker) => {
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(worker.trade);
      const matchesRate = worker.hourlyRate >= rateMin && worker.hourlyRate <= rateMax;
      const matchesRating = worker.rating >= minRating;
      return matchesCategory && matchesRate && matchesRating;
    });
  }, [selectedCategories, rateMin, rateMax, minRating]);

  return (
    <div className="container grid grid-cols-1 md:grid-cols-12 gap-gutter">
      <div className="md:col-span-3">
        <FilterPanel
          categories={CATEGORIES}
          selectedCategories={selectedCategories}
          onCategoryChange={toggleCategory}
          rateMin={rateMin}
          rateMax={rateMax}
          onRateChange={(min, max) => {
            setRateMin(min);
            setRateMax(max);
          }}
          minRating={minRating}
          onRatingChange={setMinRating}
        />
      </div>

      <div className="md:col-span-9 flex flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif text-headline-md text-on-surface">Available Pros</h1>
          <p className="font-sans text-body-md text-on-surface-variant">{results.length} results</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {results.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} variant="full" />
          ))}
          {results.length === 0 && (
            <p className="col-span-full font-sans text-body-md text-on-surface-variant py-12 text-center">
              No professionals match your filters. Try widening your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
