'use client';

import { SummaryData, useSummaryData } from '@/contexts/SummaryDataContext';

import Container from './Container';
import WidgetCapsule from './WidgetCapsule';
import Widget from './Widget';

export default function SummaryWidgets() {
  const { data, firstLoad, error } = useSummaryData();

  if (firstLoad) return (
    <Container>
      <WidgetCapsule className="animate-pulse" />
      <WidgetCapsule className="animate-pulse" />
      <WidgetCapsule className="animate-pulse" />
    </Container>
  );
  if (error) return (
    <Container>
      <WidgetCapsule className="text-red-400">{error}</WidgetCapsule>
      <WidgetCapsule className="text-red-400">{error}</WidgetCapsule>
      <WidgetCapsule className="text-red-400">{error}</WidgetCapsule>
    </Container>
  );
  if (!data || data.length === 0) return (
    <Container>
      <WidgetCapsule>No data available</WidgetCapsule>
      <WidgetCapsule>No data available</WidgetCapsule>
      <WidgetCapsule>No data available</WidgetCapsule>
    </Container>
  );

  // Calculate totals
  const totalSuccessful = data.reduce((sum: number, row: SummaryData) => sum + row.successful_checks, 0);
  const totalFailed = data.reduce((sum: number, row: SummaryData) => sum + row.failing_checks, 0);
  const totalChecks = data.reduce((sum: number, row: SummaryData) => sum + row.total_checks, 0);

  return (
    <Container>
      <Widget title="Successful Checks" value={totalSuccessful.toString()} detail={`(${((totalSuccessful / totalChecks) * 100).toFixed(1)}%)`} valueColorClass="text-green-400" />
      <Widget title="Failed Checks" value={totalFailed.toString()} detail={`(${((totalFailed / totalChecks) * 100).toFixed(1)}%)`} valueColorClass="text-red-400" />
      <Widget title="Total Checks" value={totalChecks.toString()} />
    </Container>
  );
}