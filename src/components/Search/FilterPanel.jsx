export default function FilterPanel({
  categories,
  selectedCategories,
  onCategoryChange,
  rateMin,
  rateMax,
  onRateChange,
}) {
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  return (
    <aside className="w-full shrink-0 rounded-lg bg-surface-container-lowest p-5 shadow-elevation-1 md:w-64">
      <h2 className="font-display text-headline-sm text-on-surface">Filters</h2>

      <div className="mt-4">
        <h3 className="text-label-md text-on-surface">Category</h3>
        <div className="mt-2 flex flex-col gap-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 text-body-md text-on-surface">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              {category}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-label-md text-on-surface">Hourly Rate ($)</h3>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={rateMin}
            onChange={(e) => onRateChange({ min: Number(e.target.value), max: rateMax })}
            placeholder="Min"
            className="h-10 w-full rounded border border-outline-variant px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-on-surface-variant">–</span>
          <input
            type="number"
            min="0"
            value={rateMax}
            onChange={(e) => onRateChange({ min: rateMin, max: Number(e.target.value) })}
            placeholder="Max"
            className="h-10 w-full rounded border border-outline-variant px-3 text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </aside>
  );
}
