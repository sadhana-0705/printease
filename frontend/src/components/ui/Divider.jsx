import React from "react";

export default function Divider({ className = "" }) {
  return (
    <hr
      className={`border-t border-gray-200 my-4 ${className}`}
    />
  );
}
