'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { useTimer } from '@/contexts/TimerContext';


export interface SummaryData {
  group_name: string;
  successful_checks: number;
  failing_checks: number;
  total_checks: number;
  last_check_timestamp: number;
}

interface SummaryDataContextType {
  data: SummaryData[] | undefined;
  firstLoad: boolean;
  error: string | null;
}

const SummaryDataContext = createContext<SummaryDataContextType | undefined>(undefined);

export const useSummaryData = () => {
  const context = useContext(SummaryDataContext);
  if (!context) {
    throw new Error('useSummaryData must be used within a SummaryDataProvider');
  }
  return context;
};

export const SummaryDataProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<SummaryData[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const { reloadDate } = useTimer();

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/current_summary.json?token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`
    )
      .then((response) => {
        if (!response.ok) {
            throw new Error('Failed to fetch summary data');
          }
          return response.json();
        })
        .then((json) => {
          setData(json.data);
          setFirstLoad(false);
        })
        .catch((err) => {
          setError(err.message);
          setFirstLoad(false);
        });
  }, [reloadDate]);

  return (
    <SummaryDataContext.Provider value={{ data, firstLoad, error }}>
      {children}
    </SummaryDataContext.Provider>
  );
};
