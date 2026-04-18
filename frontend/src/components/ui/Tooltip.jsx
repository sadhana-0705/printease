import React from "react";

export default function Tooltip({ text, children }) {
  return (
    <div className="relative group inline-block">
      {children}
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        hidden group-hover:block bg-black text-white text-xs
        rounded px-2 py-1 whitespace-nowrap"
      >
        {text}
      </span>
    </div>
  );
}
