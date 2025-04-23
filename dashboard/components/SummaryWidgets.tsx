import { SummaryData, fetchSummaryData } from '@/lib/fetchData';

export default async function SummaryWidgets() {
  try {
    const data = await fetchSummaryData();

    if (data === undefined || data.length === 0) {
      return <div className="text-center p-4 text-gray-300">No data available</div>;
    }

    // Calculate totals
    const totalSuccessful = data.reduce((sum: number, row: SummaryData) => sum + row.successful_checks, 0);
    const totalFailed = data.reduce((sum: number, row: SummaryData) => sum + row.failing_checks, 0);
    const totalChecks = data.reduce((sum: number, row: SummaryData) => sum + row.total_checks, 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Successful Checks</h3>
          <div className="flex items-baseline gap-2 font-mono">
            <p className="text-3xl font-bold text-green-400">{totalSuccessful}</p>
            <p className="text-base text-gray-300">
              ({((totalSuccessful / totalChecks) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Failed Checks</h3>
          <div className="flex items-baseline gap-2 font-mono">
            <p className="text-3xl font-bold text-red-400">{totalFailed}</p>
            <p className="text-base text-gray-300">
              ({((totalFailed / totalChecks) * 100).toFixed(1)}%)
            </p>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Checks</h3>
          <p className="text-3xl font-bold text-gray-300 font-mono">{totalChecks}</p>
        </div>
      </div>
    );
  } catch (error) {
    return <div className="text-red-500">Error: {error instanceof Error ? error.message : 'An error occurred'}</div>;
  }
}