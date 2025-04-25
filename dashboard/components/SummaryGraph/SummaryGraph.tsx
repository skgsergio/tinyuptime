'use client';

import { useState, useEffect } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer 
} from "recharts";

import { formatDateTime, formatHour } from "@/lib/dateUtils";
import { useTimer } from '@/contexts/TimerContext';

import IntervalButtons from "./IntervalButtons";
import Container from './Container';

export interface SummaryTimeseriesPointData {
  timestamp: number;
  group_name: string;
  successful_checks: number;
  failing_checks: number;
  total_checks: number;
}

export default function SummaryGraph() {
  const [data, setData] = useState<SummaryTimeseriesPointData[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentInterval, setIntervalParam] = useState('1d');
  const { reloadDate } = useTimer();

  useEffect(() => {
    const fetchData = (showLoading: boolean) => {
      if (showLoading) setLoading(true);  
      fetch(
        `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/summaries_timeseries.json?interval=${currentInterval}&token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch summary timeseries data');
          }
          return response.json();
        })
        .then((json) => {
          setData(json.data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    };

    fetchData(true);
  }, [currentInterval, reloadDate]);

  if (loading) return <Container className="animate-pulse"></Container>;
  if (error) return <Container className="text-red-400">{error}</Container>;
  if (!data || data.length === 0) return <Container>No data available</Container>;

  // Group data by timestamp
  const timestamps = Array.from(new Set(data.map((d) => d.timestamp))).sort();
  const groupNames = Array.from(new Set(data.map((d) => d.group_name)));

  // Create chart data: one object per timestamp, each with group_name: failing_checks
  const chartData = timestamps.map((ts) => {
    const entry: { timestamp: number; [key: string]: number } = { timestamp: ts };
    
    groupNames.forEach((group) => {
      const found = data.find((d) => d.timestamp === ts && d.group_name === group);
      entry[group] = found ? found.failing_checks : 0;
    });
    return entry;
  });

  const palette = [
    "var(--color-red-400)",
    "var(--color-blue-400)",
    "var(--color-yellow-400)",
    "var(--color-green-400)",
    "var(--color-purple-400)",
    "var(--color-pink-400)",
    "var(--color-sky-400)",
    "var(--color-rose-400)",
    "var(--color-amber-400)",
  ];

  return (
    <Container>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">Failing Checks Over Time</h3>
      <IntervalButtons currentInterval={currentInterval} setIntervalParam={setIntervalParam} />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ right: 25 }}>
          <XAxis
            className="text-sm font-mono fill-gray-300"
            stroke="var(--color-gray-300)"
            dataKey="timestamp"
            tickCount={10}
            tickFormatter={formatHour}
            scale="time"
            minTickGap={50}
          />
          <YAxis
            className="text-sm font-mono fill-gray-300"
            width={45}
            stroke="var(--color-gray-300)"
            allowDecimals={false}
          />
          <Tooltip
            wrapperClassName="rounded font-mono text-sm"
            labelClassName="font-bold pb-2"
            contentStyle={{ backgroundColor: "var(--color-gray-950)", color: "var(--color-white)", border: undefined }}
            labelFormatter={(ts) => formatDateTime(ts) }
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend
            iconType="line"
            formatter={(value, entry, idx) => (
              <span className="text-sm font-mono" style={{ color: palette[idx % palette.length] }}>{value}</span>
            )}
          />
          {groupNames.map((group, idx) => (
            <Line
              key={group}
              type="linear"
              dataKey={group}
              stroke={palette[idx % palette.length]}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Container>
  );
}

