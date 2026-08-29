const VARIANT_CLASSES = {
  default: "bg-surface-container text-on-surface border border-on-surface/10",
  outline: "bg-transparent text-on-surface border border-outline-variant",
  tertiary: "bg-tertiary-container/20 text-on-surface-variant border border-tertiary/20",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1 text-[10px]",
  md: "px-4 py-1.5 text-[12px]",
};

export default function Chip({
  variant = "default",
  size = "md",
  as: Component = "span",
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center gap-1 rounded-lg font-sans font-semibold uppercase tracking-[0.1em] ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
