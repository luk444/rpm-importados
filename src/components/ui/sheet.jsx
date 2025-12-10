import React from "react";

export function Sheet({ children, open }) {
  if (!open) return null;
  return <>{children}</>;
}

export function SheetContent({ className = "", children, onOpenChange }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => onOpenChange?.(false)}
      />
      <aside
        className={`relative h-full w-full max-w-md bg-white shadow-2xl animate-slide-in ${className}`}
      >
        {children}
      </aside>
    </div>
  );
}

export function SheetHeader({ className = "", ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function SheetTitle({ className = "", ...props }) {
  return (
    <div className={`text-lg font-semibold leading-none ${className}`} {...props} />
  );
}

export function SheetFooter({ className = "", ...props }) {
  return <div className={`p-4 ${className}`} {...props} />;
}

export function SheetTrigger({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

// Simple animation utility
const style = document.createElement("style");
style.innerHTML = `
@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0%); }
}
.animate-slide-in { animation: slide-in 0.25s ease-out; }
`;
document.head.appendChild(style);

