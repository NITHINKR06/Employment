const STATUS_TONES = {
  Confirmed: "success",
  Upcoming: "success",
  Completed: "neutral",
  Pending: "warning",
  Cancelled: "error",
};

const TONE_CLASSES = {
  success: "bg-primary-container text-on-primary-container",
  warning: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container text-on-surface-variant",
};

export function statusToneClasses(status) {
  const tone = STATUS_TONES[status] ?? "neutral";
  return TONE_CLASSES[tone];
}
