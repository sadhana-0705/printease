export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
}) {
  const base =
    "font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 rounded-lg",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  const variants = {
    primary: "btn-primary focus:ring-primary-500 hover-lift",
    secondary: "btn-secondary focus:ring-secondary-500 hover-lift",
    accent: "btn-accent focus:ring-accent-500 hover-lift",
    danger: "btn-danger focus:ring-red-500 hover-lift",
    outline: "btn-outline focus:ring-primary-500",
    ghost: "text-neutral-700 hover:bg-neutral-100 focus:ring-neutral-500 px-3 py-2 rounded-md",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${widthClass} ${className}`}
    >
      {children}
    </button>
  );
}
