import Link from "next/link";

const VARIANT_CLASSES = {
  primary: "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container",
  secondary: "bg-surface-container-lowest text-on-surface border border-on-surface hover:bg-surface-container-low",
  text: "bg-transparent text-primary hover:underline",
};

const SIZE_CLASSES = {
  md: "h-11 px-5 text-label-md",
  lg: "h-12 px-6 text-label-md",
};

export default function Button({
  variant = "primary",
  size = "lg",
  href,
  type = "button",
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  ...rest
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded font-sans font-semibold transition-colors whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className="shrink-0" aria-hidden="true" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="shrink-0" aria-hidden="true" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...rest}>
      {content}
    </button>
  );
}
