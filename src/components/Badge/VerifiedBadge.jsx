import { MdVerified } from "react-icons/md";

export default function VerifiedBadge({ variant = "inline", size = "md", className = "" }) {
  const iconSize = size === "sm" ? "text-sm" : "text-base";

  if (variant === "pin") {
    return (
      <span
        className={`absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-primary text-on-primary p-1 ring-2 ring-surface ${className}`}
        aria-label="Verified professional"
      >
        <MdVerified className={iconSize} />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-primary ${className}`}
      aria-label="Verified professional"
    >
      <MdVerified className={iconSize} />
    </span>
  );
}
