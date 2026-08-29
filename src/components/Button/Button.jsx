import Link from "next/link";

const VARIANT_CLASSES = {
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  secondary:
    "bg-transparent border border-on-surface text-on-surface hover:bg-on-surface hover:text-surface",
  text: "bg-transparent text-primary hover:underline underline-offset-4 px-0",
};

const SIZE_CLASSES = {
  md: "py-3 px-6 text-[12px]",
  lg: "py-4 px-8 text-[12px]",
};

export default function Button({
  variant = "primary",
  size = "lg",
  as,
  href,
  type = "button",
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded font-sans font-semibold uppercase tracking-[0.1em] transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${variant !== "text" ? SIZE_CLASSES[size] : ""} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === "left" && <Icon className="text-lg" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="text-lg" />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes} {...props}>
      {content}
    </button>
  );
}
