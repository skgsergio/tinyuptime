const REVALIDATE_SECONDS = 150;

export interface LastHourData {
  check_name: string;
  timestamps: number[];
  success_statuses: boolean[];
  durations_seconds: (number | null)[];
  last_check_error: string;
}

export async function fetchLastHourData(): Promise<LastHourData[]> {
  const response = await fetch(
    `${process.env.TINYBIRD_TINYUPTIME_HOST}/v0/pipes/last_hour.json?token=${process.env.TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch summary data');
  }
  
  const result = await response.json();
  return result.data;
}

export interface SummaryData {
  group_name: string;
  successful_checks: number;
  failing_checks: number;
  total_checks: number;
  last_check_timestamp: number;
}

export async function fetchSummaryData(): Promise<SummaryData[]> {
  const response = await fetch(
    `${process.env.TINYBIRD_TINYUPTIME_HOST}/v0/pipes/current_summary.json?token=${process.env.TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch summary data');
  }
  
  const result = await response.json();
  return result.data;
}

export interface SummaryTimeseriesPointData {
  timestamp: number;
  group_name: string;
  successful_checks: number;
  failing_checks: number;
  total_checks: number;
}

export async function fetchSummaryTimeseriesData(): Promise<SummaryTimeseriesPointData[]> {
  const response = await fetch(
    `${process.env.TINYBIRD_TINYUPTIME_HOST}/v0/pipes/summaries_timeseries.json?interval=1d&token=${process.env.TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`,
    { next: { revalidate: REVALIDATE_SECONDS } }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch summary timeseries data');
  }
  
  const result = await response.json();
  return result.data;
}
