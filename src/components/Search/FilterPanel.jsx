const RATING_OPTIONS = [3, 4, 4.5];

export default function FilterPanel({
  categories,
  selectedCategories,
  onCategoryChange,
  rateMin,
  rateMax,
  onRateChange,
  minRating,
  onRatingChange,
}) {
  return (
    <aside className="flex flex-col gap-8">
      <div>
        <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-4">
          Category
        </h3>
        <div className="flex flex-col gap-3">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-3 font-sans text-body-md text-on-surface">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => onCategoryChange(category)}
                className="accent-primary h-4 w-4"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-4">
          Hourly Rate
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={rateMin}
            onChange={(event) => onRateChange(Number(event.target.value), rateMax)}
            className="minimal-input w-full py-1 font-sans text-body-md text-on-surface"
            placeholder="Min"
          />
          <span className="text-on-surface-variant">-</span>
          <input
            type="number"
            value={rateMax}
            onChange={(event) => onRateChange(rateMin, Number(event.target.value))}
            className="minimal-input w-full py-1 font-sans text-body-md text-on-surface"
            placeholder="Max"
          />
        </div>
      </div>

      <div>
        <h3 className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-4">
          Rating
        </h3>
        <div className="flex gap-2">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onRatingChange(minRating === option ? 0 : option)}
              className={`rounded-lg border px-3 py-1.5 font-sans text-[13px] transition-colors ${
                minRating === option
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline-variant text-on-surface hover:border-primary"
              }`}
            >
              {option}+
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
