import { FaStar } from "react-icons/fa6";

export default function Rating({ value = 0, count, variant = "inline", size = "md" }) {
  const iconSize = size === "sm" ? "text-xs" : "text-sm";
  const textSize = size === "sm" ? "text-label-sm" : "text-label-md";

  const stars = (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <FaStar
          key={i}
          className={`${iconSize} ${i < Math.round(value) ? "text-tertiary" : "text-surface-container-high"}`}
          aria-hidden="true"
        />
      ))}
    </span>
  );

  const label = (
    <span className={`${textSize} font-semibold text-on-surface`}>
      {value.toFixed(1)}
      {typeof count === "number" && (
        <span className="ml-1 font-normal text-on-surface-variant">({count})</span>
      )}
    </span>
  );

  if (variant === "pill") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-lowest px-2.5 py-1 shadow-elevation-1">
        <FaStar className={`${iconSize} text-tertiary`} aria-hidden="true" />
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      {stars}
      {label}
    </span>
  );
}
