const VARIANT_CLASSES = {
  default: "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-secondary-container hover:text-on-secondary-container hover:border-secondary-container",
  outline: "bg-transparent border border-outline-variant text-on-surface-variant",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed-variant border border-transparent",
};

const SIZE_CLASSES = {
  sm: "px-3 py-1 text-label-sm rounded-full",
  md: "px-4 py-1.5 text-label-sm rounded-full",
};

export default function Chip({
  variant = "default",
  size = "md",
  as: Component = "span",
  className = "",
  children,
  ...rest
}) {
  return (
    <Component
      className={`inline-flex items-center gap-1 font-sans transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
