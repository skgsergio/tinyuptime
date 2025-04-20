import { formatDateTime } from '@/lib/dateUtils';

interface StatusBarGraphProps {
  successStatuses: boolean[];
  timestamps: number[];
}

export default function StatusBarGraph({ successStatuses, timestamps }: StatusBarGraphProps) {
  const recentStatuses = successStatuses.toReversed();
  const recentTimestamps = timestamps.toReversed();

  return (
    <div className="mt-2">
      <div className="flex h-4 gap-0.5">
        {recentStatuses.map((status, index) => (
          <div
            key={index}
            className={`flex-1 rounded-sm ${
              status ? 'bg-green-500' : 'bg-red-500'
            }`}
            title={`${formatDateTime(recentTimestamps[index])} - ${
              status ? 'Success' : 'Failed'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatDateTime(recentTimestamps[0])}</span>
        <span>{formatDateTime(recentTimestamps[recentTimestamps.length - 1])}</span>
      </div>
    </div>
  );
} 