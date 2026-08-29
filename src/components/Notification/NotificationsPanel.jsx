import NotificationItem from "./NotificationItem";

export default function NotificationsPanel({ notifications, variant = "full" }) {
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className={variant === "full" ? "rounded-xl border border-on-surface/10 p-2" : ""}>
      {variant === "full" && (
        <div className="flex items-center justify-between px-4 py-3">
          <h3 className="font-serif text-headline-sm text-on-surface">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-on-primary text-[11px] font-sans font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col divide-y divide-on-surface/5">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
