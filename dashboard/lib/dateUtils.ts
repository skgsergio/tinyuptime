export const formatDateTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'short',
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE || 'Etc/UTC'
  });
};

export const formatHour = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: process.env.NEXT_PUBLIC_TIMEZONE || 'Etc/UTC'
  });
};