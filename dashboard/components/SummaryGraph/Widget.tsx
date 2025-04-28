"use client";

export default function Widget({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg shadow-lg bg-gray-800 p-6 h-110 ${className || ""}`}
    >
      {children}
    </div>
  );
}
