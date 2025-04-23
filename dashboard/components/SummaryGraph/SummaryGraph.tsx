import Graph from './Graph';
import { fetchSummaryTimeseriesData } from '@/lib/fetchData';

export default async function CheckStatusWidgets() {
  try {
    const data = await fetchSummaryTimeseriesData();

    return <Graph data={data} />;
  } catch (error) {
    return <div className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>;
  }
}
