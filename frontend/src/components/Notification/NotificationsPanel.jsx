import NotificationItem from "./NotificationItem";

export default function NotificationsPanel({ notifications, variant = "full", onClearAll }) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={variant === "full" ? "rounded-lg bg-surface-container-lowest p-5 shadow-elevation-1" : ""}>
      {variant === "full" && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-headline-sm text-on-surface">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-label-sm font-semibold text-on-primary">
              {unreadCount}
            </span>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-body-md text-on-surface-variant">
            No notifications yet.
          </p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
      {onClearAll && notifications.length > 0 && (
        <button
          onClick={onClearAll}
          className="mt-3 self-end text-label-sm text-primary hover:underline"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
