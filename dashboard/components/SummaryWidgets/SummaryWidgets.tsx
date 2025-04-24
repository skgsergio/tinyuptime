'use client';

import { ErrorMessage, NoDataMessage } from '@/components/Messages';
import { SummaryData, useSummaryData } from '@/contexts/SummaryDataContext';

import Widget from './Widget';

export default function SummaryWidgets() {
  const { data, loading, error } = useSummaryData();

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse h-32"></div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse h-32"></div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-pulse h-32"></div>
    </div>
  );
  if (error) return <ErrorMessage error={error} />;
  if (!data || data.length === 0) return <NoDataMessage />;

  // Calculate totals
  const totalSuccessful = data.reduce((sum: number, row: SummaryData) => sum + row.successful_checks, 0);
  const totalFailed = data.reduce((sum: number, row: SummaryData) => sum + row.failing_checks, 0);
  const totalChecks = data.reduce((sum: number, row: SummaryData) => sum + row.total_checks, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Widget title="Successful Checks" value={totalSuccessful.toString()} detail={`(${((totalSuccessful / totalChecks) * 100).toFixed(1)}%)`} valueColorClass="text-green-400" />
      <Widget title="Failed Checks" value={totalFailed.toString()} detail={`(${((totalFailed / totalChecks) * 100).toFixed(1)}%)`} valueColorClass="text-red-400" />
      <Widget title="Total Checks" value={totalChecks.toString()} />
    </div>
  );
}