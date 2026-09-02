import { statusToneClasses } from "@/data/statusColors";

export default function StatBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-label-sm font-semibold ${statusToneClasses(status)}`}
    >
      {status}
    </span>
  );
}
