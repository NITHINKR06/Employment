export default function Stepper({ steps, currentIndex }) {
  return (
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-label-md font-semibold ${
                  isDone || isCurrent
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`text-label-sm ${isCurrent ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${isDone ? "bg-primary" : "bg-surface-container-high"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
