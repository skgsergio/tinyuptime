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
            title={`${new Date(recentTimestamps[index] * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${
              status ? 'Success' : 'Failed'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{new Date(recentTimestamps[0] * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
        <span>{new Date(recentTimestamps[recentTimestamps.length - 1] * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
      </div>
    </div>
  );
} 