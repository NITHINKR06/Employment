"use client";

import { IoCloseOutline } from "react-icons/io5";

export default function FilterPanel({
  categories,
  selectedCategories,
  onCategoryChange,
  rateMin,
  rateMax,
  onRateChange,
  minRating,
  onRatingChange,
  onClearAll,
}) {
  const toggleCategory = (categoryName) => {
    if (selectedCategories.includes(categoryName)) {
      onCategoryChange(selectedCategories.filter((c) => c !== categoryName));
    } else {
      onCategoryChange([...selectedCategories, categoryName]);
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || rateMin > 0 || rateMax < 200 || minRating > 0;

  return (
    <aside className="w-full shrink-0 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1 md:w-64">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-headline-sm text-on-surface">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-label-sm font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-6 border-t border-outline-variant/40 pt-5">
        <h3 className="text-label-md font-semibold text-on-surface">Category</h3>
        <div className="mt-3 flex flex-col gap-2.5">
          {categories.map((category) => (
            <label key={category.id ?? category.name} className="flex cursor-pointer items-center justify-between gap-2.5 text-body-md text-on-surface">
              <span className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.name)}
                  onChange={() => toggleCategory(category.name)}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="text-label-md text-on-surface-variant hover:text-on-surface">{category.name}</span>
              </span>
              <span className="text-label-sm text-on-surface-variant">{category.count}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-outline-variant/40 pt-5">
        <h3 className="text-label-md font-semibold text-on-surface">Hourly Rate ($)</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={rateMin}
            onChange={(e) => onRateChange({ min: Number(e.target.value), max: rateMax })}
            placeholder="Min"
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-on-surface-variant">–</span>
          <input
            type="number"
            min="0"
            value={rateMax}
            onChange={(e) => onRateChange({ min: rateMin, max: Number(e.target.value) })}
            placeholder="Max"
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface px-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="mt-6 border-t border-outline-variant/40 pt-5">
        <h3 className="text-label-md font-semibold text-on-surface">Minimum Rating</h3>
        <div className="mt-3 flex flex-col gap-2">
          {[
            { label: "All Ratings", value: 0 },
            { label: "4.5★ and above", value: 4.5 },
            { label: "4.8★ and above", value: 4.8 },
          ].map((item) => (
            <label key={item.value} className="flex cursor-pointer items-center gap-2.5">
              <input
                type="radio"
                name="ratingFilter"
                checked={minRating === item.value}
                onChange={() => onRatingChange(item.value)}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <span className="text-label-md text-on-surface-variant">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
