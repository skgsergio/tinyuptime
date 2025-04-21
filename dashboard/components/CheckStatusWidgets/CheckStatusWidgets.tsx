import PaginatedWidgets from './PaginatedWidgets';
import { fetchLastHourData } from '@/lib/lastHourData';

export default async function CheckStatusWidgets() {
  try {
    const data = await fetchLastHourData();

    return <PaginatedWidgets checkStatuses={data} />;
  } catch (error) {
    return <div className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>;
  }
}
