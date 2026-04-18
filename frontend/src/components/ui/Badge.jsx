export default function Badge({ text, status, size = "sm" }) {
  const statusLower = status?.toLowerCase() || "pending";
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };
  
  return (
    <span
      className={`badge-${statusLower} ${sizes[size]} rounded-full font-semibold shadow-sm inline-flex items-center`}
    >
      {text}
    </span>
  );
}
