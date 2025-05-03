"use client";

import { useTimer } from "@/contexts/TimerContext";
import RefreshIcon from "@/components/Icons/RefreshIcon";

export default function PageRefresh() {
  const { timeLeft, setTimeLeft } = useTimer();

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <span
      className="fixed bottom-2 right-4 z-50 cursor-pointer text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-full font-mono shadow-lg border border-gray-700 border-1px hover:bg-gray-700 hover:border-gray-600 transition-all"
      onClick={() => setTimeLeft(0)}
    >
      <RefreshIcon className="inline-block" /> {formattedTime}
    </span>
  );
}
