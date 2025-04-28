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
import Widget from './Widget';

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

const GRAPH_COLORS = [
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
          //remove duplicated json.data entries
          const uniqueMarkers = json.data.filter((marker: MarkerTimeseriesPointData, index: number) => {
            return json.data.findIndex((m: MarkerTimeseriesPointData) => m.start === marker.start && m.end === marker.end && m.name === marker.name) === index;
          });

          setMarkers(uniqueMarkers);
        })
        .catch((err) => {
          setError(err.message);
        });
    };

    fetchMarkers();
  }, [currentInterval, reloadDate]);

  if (firstLoad) return <Widget className="animate-pulse"></Widget>;
  if (error) return <Widget className="text-red-400">{error}</Widget>;
  if (!data || data.length === 0) return <Widget>No data available</Widget>;

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

  // Create a list of unique markers by start and end date
  const uniqueMarkers: { [key: string]: { start: number; end: number} } = {};
  markers.forEach((marker) => {
    const key = `${marker.start}-${marker.end}`;
    uniqueMarkers[key] = { start: marker.start, end: marker.end };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">  
      <Widget className="md:col-span-2">
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
                <span className="text-sm font-mono" style={{ color: GRAPH_COLORS[idx % GRAPH_COLORS.length] }}>{value}</span>
              )}
            />
            {Object.entries(uniqueMarkers).map(([key, { start, end }]) => (
              <ReferenceArea
                key={key}
                x1={start}
                x2={end}
                stroke="var(--color-yellow-700)"
                strokeWidth={1}
                strokeDasharray="5"
                strokeOpacity={0.75}
                fill="var(--color-yellow-800)"
                fillOpacity={0.1}
                ifOverflow="hidden"
              />
            ))}
            
            {groupNames.map((group, idx) => (
              <Line
                key={group}
                type="linear"
                dataKey={group}
                stroke={GRAPH_COLORS[idx % GRAPH_COLORS.length]}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Widget>
      <Widget className="overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Markers</h3>
        {markers.length > 0 ? (
          <ul>
            {markers.map((marker) => (
              <li key={`${marker.start}-${marker.end}-${marker.name}`} className="text-sm font-mono">
                {formatHour(marker.start)}-{formatHour(marker.end)}: {marker.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No markers found</p>
        )}
      </Widget>
    </div>
  );
}