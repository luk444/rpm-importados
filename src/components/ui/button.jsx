import React from "react";

const base =
  "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
  default: "bg-black text-white hover:bg-gray-800",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:border-gray-200",
  ghost: "text-gray-700 hover:bg-gray-100",
};

const sizes = {
  md: "h-10 px-4 py-2 text-sm rounded-lg",
  lg: "h-12 px-5 py-2.5 text-base rounded-xl",
  icon: "h-10 w-10 p-0 rounded-lg",
};

export function Button({
  className = "",
  variant = "default",
  size = "md",
  ...props
}) {
  return (
    <button
      className={[base, variants[variant], sizes[size], className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}

export default Button;

