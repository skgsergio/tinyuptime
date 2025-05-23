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
      className={`rounded-lg shadow-lg bg-gray-800 min-h-80 ${className || ""}`}
    >
      {children}
    </div>
  );
}
