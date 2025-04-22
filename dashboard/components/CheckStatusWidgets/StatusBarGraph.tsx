'use client';

import { formatDateTime, formatHour } from '@/lib/dateUtils';

interface StatusBarGraphProps {
  successStatuses: boolean[];
  timestamps: number[];
}

export default function StatusBarGraph({ successStatuses, timestamps }: StatusBarGraphProps) {
  const recentStatuses = successStatuses.toReversed();
  const recentTimestamps = timestamps.toReversed();

  const tooltipThreshold = Math.floor(recentStatuses.length * 0.25);

  return (
    <div className="mt-2">
      <div className="flex h-4 gap-0.5">
        {recentStatuses.map((status, index) => {
          let tooltipPositionClass = 'left-1/2 -translate-x-1/2';
          if (index < tooltipThreshold) tooltipPositionClass = 'left-0 -translate-x-0';
          else if (index >= recentStatuses.length - tooltipThreshold) tooltipPositionClass = 'right-0 translate-x-0';
          return (
            <div key={index} className="relative flex-1 group focus:outline-none" tabIndex={0}>
              <div
                className={`w-full h-4 rounded-sm ${status ? 'bg-green-500' : 'bg-red-500'}`}
              />
              <div className={`absolute top-6 ${tooltipPositionClass} whitespace-nowrap px-2 py-1 text-sm text-white bg-gray-950 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none z-10 max-w-[calc(100vw-2rem)] min-w-0 overflow-x-hidden`}>
                {formatDateTime(recentTimestamps[index])}
              </div>
            </div>
        );
      })}
      </div>
      <div className="flex justify-between text-sm text-gray-300 mt-1 font-mono">
        <span>{formatHour(recentTimestamps[0])}</span>
        <span>{formatHour(recentTimestamps[recentTimestamps.length - 1])}</span>
      </div>
    </div>
  );
}