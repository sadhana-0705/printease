export default function Card({ children, className = "", hoverEffect = true }) {
  const baseClasses = "card p-6 rounded-xl shadow-soft border border-neutral-200";
  const hoverClasses = hoverEffect ? "card-hover hover-lift" : "";
  
  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}
