"use client";

export default function Container({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">{children}</div>
  );
}
