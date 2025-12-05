"use client";

export default function Container({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-gray-800 p-6 mb-6 rounded-lg shadow-lg ${className || ""}`}>
      {children}
    </div>
  );
}
