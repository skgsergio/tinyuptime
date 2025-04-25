'use client';

import { useTimer } from '@/contexts/TimerContext';

export default function PageRefresh() {
  const { timeLeft } = useTimer();

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <span
      className="fixed top-4 right-4 z-50 text-sm text-gray-300 bg-gray-800 bg-opacity-80 px-3 py-1 rounded-full font-mono shadow-lg border border-gray-700 border-1px"
      style={{ pointerEvents: 'none' }}
    >
      Refreshing in {formattedTime}
    </span>
  );
}