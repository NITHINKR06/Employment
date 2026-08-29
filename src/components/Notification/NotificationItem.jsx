import {
  IoCalendarOutline,
  IoChatbubbleOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { FaStar } from "react-icons/fa6";

const ICONS = {
  calendar_today: IoCalendarOutline,
  chat_bubble: IoChatbubbleOutline,
  check_circle: IoCheckmarkCircleOutline,
  star: FaStar,
};

export default function NotificationItem({ notification }) {
  const Icon = ICONS[notification.icon] ?? IoCheckmarkCircleOutline;

  return (
    <div
      className={`flex items-start gap-3 p-4 border-l-2 ${
        notification.read ? "border-transparent opacity-60" : "border-primary"
      }`}
    >
      <span className="flex items-center justify-center h-8 w-8 rounded-full bg-surface-container-low text-primary shrink-0">
        <Icon className="text-sm" />
      </span>
      <div className="min-w-0">
        <p className="font-sans text-[14px] text-on-surface">{notification.text}</p>
        <p className="font-sans text-[12px] text-on-surface-variant mt-1">{notification.timestamp}</p>
      </div>
    </div>
  );
}
