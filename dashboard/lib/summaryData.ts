export interface SummaryData {
  group_name: string;
  scope: string;
  successful_checks: number;
  failing_checks: number;
  total_checks: number;
  last_check_timestamp: number;
}

export async function fetchSummaryData(): Promise<SummaryData[]> {
const response = await fetch(
  `${process.env.TINYBIRD_TINYUPTIME_HOST}/v0/pipes/summary.json?token=${process.env.TINYBIRD_TINYUPTIME_SUMMARY_TOKEN}`,
  { next: { revalidate: 300 } }
);

if (!response.ok) {
  throw new Error('Failed to fetch summary data');
}

const result = await response.json();
return result.data;
}
