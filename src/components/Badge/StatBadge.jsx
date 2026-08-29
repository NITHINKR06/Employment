import { getStatusTone, STATUS_TONE_CLASSES } from "@/data/statusColors";

export default function StatBadge({ status, className = "" }) {
  const tone = getStatusTone(status);

  return (
    <span
      className={`inline-flex items-center rounded-lg px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] ${STATUS_TONE_CLASSES[tone]} ${className}`}
    >
      {status}
    </span>
  );
}
