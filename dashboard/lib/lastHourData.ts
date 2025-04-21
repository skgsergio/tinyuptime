export interface LastHourData {
  check_name: string;
  scope: string;
  timestamps: number[];
  success_statuses: boolean[];
  durations_seconds: (number | null)[];
  last_check_error: string;
}

export async function fetchLastHourData(): Promise<LastHourData[]> {
    const response = await fetch(
      `${process.env.TINYBIRD_TINYUPTIME_HOST}/v0/pipes/last_hour.json?token=${process.env.TINYBIRD_TINYUPTIME_LAST_HOUR_TOKEN}`,
      { next: { revalidate: 300 } }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch summary data');
    }
    
    const result = await response.json();
    return result.data;
  }