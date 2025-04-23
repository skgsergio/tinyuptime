import Graph from './Graph';
import { fetchSummaryTimeseriesData } from '@/lib/fetchData';

export default async function CheckStatusWidgets({ searchParams }: { searchParams?: { [key: string]: string } }) {
  try {
    const interval = (await searchParams)?.interval || undefined;
    const data = await fetchSummaryTimeseriesData(interval);

    return <Graph data={data} />;
  } catch (error) {
    return <div className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>;
  }
}
