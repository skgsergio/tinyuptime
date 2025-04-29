export const formatDateTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short",
  });
};

export const formatHour = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatDateTimeRange = (start: number, end: number) => {
  return `${formatDateTime(start)} - ${formatDateTime(end)}`;
};
