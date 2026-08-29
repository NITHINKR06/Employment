import { FaStar } from "react-icons/fa6";

export default function Rating({ value, count, variant = "inline", size = "md", className = "" }) {
  const iconSize = size === "sm" ? "text-sm" : "text-base";
  const textSize = size === "sm" ? "text-[12px]" : "text-[14px]";

  const content = (
    <>
      <FaStar className={`${iconSize} text-primary`} />
      <span className={`font-sans font-semibold text-on-surface ${textSize}`}>{value}</span>
      {typeof count === "number" && (
        <span className={`font-sans text-on-surface-variant ${textSize}`}>({count})</span>
      )}
    </>
  );

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-lg bg-surface-container-low px-3 py-1 ${className}`}
      >
        {content}
      </span>
    );
  }

  return <span className={`inline-flex items-center gap-1 ${className}`}>{content}</span>;
}
