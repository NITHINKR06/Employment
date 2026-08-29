const STATUS_TONES = {
  Confirmed: "success",
  Upcoming: "success",
  Completed: "neutral",
  Pending: "warning",
  Cancelled: "error",
};

export function getStatusTone(status) {
  return STATUS_TONES[status] ?? "neutral";
}

export const STATUS_TONE_CLASSES = {
  success: "bg-primary-container text-on-primary-container",
  warning: "bg-tertiary-container text-on-tertiary-container",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container text-on-surface-variant",
};
