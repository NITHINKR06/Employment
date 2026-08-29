export default function Stepper({ steps, currentIndex }) {
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 w-full bg-surface-container">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant bg-surface">
        Step {currentIndex + 1} of {steps.length} — {steps[currentIndex]}
      </p>
    </div>
  );
}
