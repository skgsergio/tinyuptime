'use client';

import { useState, useEffect } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer, 
  CartesianGrid,
  ReferenceArea
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

export interface MarkerTimeseriesPointData {
  start: number;
  end: number;
  name: string;
  class: string;
}

export default function SummaryGraph() {
  const [data, setData] = useState<SummaryTimeseriesPointData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [currentInterval, setIntervalParam] = useState('1d');
  const [markers, setMarkers] = useState<MarkerTimeseriesPointData[]>([]);
  const { reloadDate } = useTimer();

  useEffect(() => {
    const fetchData = () => {
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
          setFirstLoad(false);
        })
        .catch((err) => {
          setError(err.message);
          setFirstLoad(false);
        });
    };

    fetchData();
  }, [currentInterval, reloadDate]);

  useEffect(() => {
    const fetchMarkers = () => {
      fetch(
        `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/markers_timeseries.json?interval=${currentInterval}&token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch markers timeseries data');
          }
          return response.json();
        })
        .then((json) => {
          setMarkers(json.data);
        })
        .catch((err) => {
          setError(err.message);
        });
    };

    fetchMarkers();
  }, [currentInterval, reloadDate]);

  if (firstLoad) return <Container className="animate-pulse"></Container>;
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

  // Deduplicate markers
  const deduplicatedMarkers: { [key: string]: string[] } = {};

  markers.forEach((marker) => {
    const key = `${marker.start}-${marker.end}`;

    if (!deduplicatedMarkers[key]) {
      deduplicatedMarkers[key] = [marker.name];
    } else {
      deduplicatedMarkers[key].push(marker.name);
    }
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
          <CartesianGrid
            stroke="var(--color-gray-700)"
            strokeDasharray="4"
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
          {Object.entries(deduplicatedMarkers).map(([key, names]) => (
            <ReferenceArea
              key={key}
              x1={Number(key.split('-')[0])}
              x2={Number(key.split('-')[1])}
              stroke="var(--color-yellow-700)"
              strokeWidth={1}
              strokeDasharray="5"
              strokeOpacity={0.75}
              fill="var(--color-yellow-800)"
              fillOpacity={0.1}
            />
          ))}
          
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