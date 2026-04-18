export default function Input({ label, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        {...props}
        className={`input-field px-3 py-2 focus:outline-none ${className}`}
      />
    </div>
  );
}
