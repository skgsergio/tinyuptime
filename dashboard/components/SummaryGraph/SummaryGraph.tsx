import Graph from './Graph';
import { fetchSummaryTimeseriesData } from '@/lib/fetchData';

export default async function SummaryGraph({ interval }: { interval: string | undefined }) {
  const currentInterval = interval || "1d";

  try {
    const data = await fetchSummaryTimeseriesData(currentInterval);

    return <Graph data={data} currentInterval={currentInterval} />;
  } catch (error) {
    return <div className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>;
  }
}
