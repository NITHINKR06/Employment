import { MdVerified } from "react-icons/md";

export default function VerifiedBadge({ size = "md", showLabel = false, className = "" }) {
  const iconSize = size === "sm" ? "text-sm" : "text-base";

  return (
    <span className={`inline-flex items-center gap-1 text-primary ${className}`}>
      <MdVerified className={iconSize} aria-hidden="true" />
      {showLabel && <span className="text-label-sm">Verified</span>}
      <span className="sr-only">Verified professional</span>
    </span>
  );
}
