export default function TextField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  error,
  rightSlot,
  placeholder,
  className = "",
  id,
  ...rest
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-label-md text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            size={20}
            aria-hidden="true"
          />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`h-12 w-full rounded border bg-surface-container-lowest text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
            Icon ? "pl-10" : "pl-4"
          } ${rightSlot ? "pr-10" : "pr-4"} ${
            error ? "border-error" : "border-outline-variant"
          }`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && <p className="mt-1 text-label-sm text-error">{error}</p>}
    </div>
  );
}
