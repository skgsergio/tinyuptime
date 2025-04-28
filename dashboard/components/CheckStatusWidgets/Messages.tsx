"use client";

export function ErrorMessage({ error }: { error: string }) {
  return <div className="text-center p-4 text-red-500">Error: {error}</div>;
}

export function LoadingMessage() {
  return <div className="text-center p-4 text-gray-300">Loading...</div>;
}

export function NoDataMessage() {
  return <div className="text-center p-4 text-gray-300">No data available</div>;
}
