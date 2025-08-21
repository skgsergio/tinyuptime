"use client";

export default function Container({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg shadow-lg bg-gray-800 min-h-20 max-h-80 mb-6 ${className || ""}`}
    >
      {children}
    </div>
  );
}
