export default function SelectableCard({ icon: Icon, title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-start gap-4 rounded-lg border-2 p-5 text-left transition-colors ${
        selected
          ? "border-primary bg-primary-container/10"
          : "border-outline-variant bg-surface-container-lowest hover:border-outline"
      }`}
    >
      {Icon && (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl ${
            selected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
          }`}
        >
          <Icon aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block font-display text-headline-sm text-on-surface">{title}</span>
        <span className="mt-1 block text-body-md text-on-surface-variant">{description}</span>
      </span>
      <span
        className={`ml-auto mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? "border-primary bg-primary" : "border-outline-variant"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-on-primary" />}
      </span>
    </button>
  );
}
