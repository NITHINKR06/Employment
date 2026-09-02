import { IoCalendarOutline, IoCheckmarkCircleOutline, IoPersonOutline } from "react-icons/io5";

const ICONS = {
  calendar: IoCalendarOutline,
  check: IoCheckmarkCircleOutline,
  person: IoPersonOutline,
};

export default function NotificationItem({ notification }) {
  const Icon = ICONS[notification.icon] ?? IoPersonOutline;

  return (
    <div
      className={`flex items-start gap-3 rounded-md border-l-4 p-3 ${
        notification.read
          ? "border-transparent opacity-60"
          : "border-primary bg-primary-container/10"
      }`}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-on-surface-variant">
        <Icon aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-body-md text-on-surface">{notification.text}</p>
        <p className="mt-0.5 text-label-sm text-on-surface-variant">{notification.timestamp}</p>
      </div>
    </div>
  );
}
