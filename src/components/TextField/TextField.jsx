export default function TextField({
  label,
  icon: Icon,
  type = "text",
  value,
  onChange,
  error,
  rightSlot,
  placeholder,
  required,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        {Icon && <Icon className="text-on-surface-variant shrink-0" size={20} />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`minimal-input w-full py-2 font-sans text-body-lg text-on-surface placeholder:text-on-surface-variant/60 ${inputClassName}`}
          {...props}
        />
        {rightSlot}
      </div>
      {error && <p className="mt-1 font-sans text-[12px] text-error">{error}</p>}
    </div>
  );
}
