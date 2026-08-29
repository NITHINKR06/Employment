export default function SelectableCard({ icon: Icon, title, description, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-start gap-4 text-left p-6 rounded-lg border transition-colors w-full ${
        selected
          ? "border-primary bg-primary-fixed/20"
          : "border-on-surface/10 hover:border-on-surface/30"
      }`}
    >
      <span
        className={`flex items-center justify-center h-11 w-11 rounded-full shrink-0 ${
          selected ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant"
        }`}
      >
        <Icon className="text-xl" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-serif text-headline-sm text-on-surface">{title}</span>
        <span className="font-sans text-[14px] text-on-surface-variant">{description}</span>
      </span>
      <span
        className={`ml-auto mt-1 shrink-0 h-5 w-5 rounded-full border-2 ${
          selected ? "border-primary bg-primary" : "border-outline-variant"
        }`}
      />
    </button>
  );
}
