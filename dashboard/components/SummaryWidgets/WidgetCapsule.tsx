'use client';

export default function WidgetCapsule({ children, className }: { children?: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg h-32 ${className || ''}`}>
      {children}
    </div>
  )
}