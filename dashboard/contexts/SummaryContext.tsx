'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SummaryData {
  group_name: string;
  scope: string;
  successful_checks: number;
  failing_checks: number;
  total_checks: number;
  last_check_timestamp: number;
}

interface SummaryContextType {
  data: SummaryData[];
  loading: boolean;
  error: string | null;
}

const SummaryContext = createContext<SummaryContextType>({
  data: [],
  loading: true,
  error: null,
});

export function SummaryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/summary.json?token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_SUMMARY_TOKEN}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SummaryContext.Provider value={{ data, loading, error }}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  return useContext(SummaryContext);
} 