"use client";

import { formatHour } from "@/lib/dateUtils";
import { SummaryTimeseriesPointData } from "@/lib/fetchData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import IntervalButtons from "./IntervalButtons";

export default function SummaryGraph({ data, currentInterval }: { data: SummaryTimeseriesPointData[]; currentInterval: string }) {
  if (!data || !data.length)
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center text-gray-400 mb-8">
        No data for graph.
      </div>
    );

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
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-lg font-semibold text-gray-300 mb-2">Failing Checks Over Time</h3>
      <IntervalButtons currentInterval={currentInterval} />
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 16, right: 32, left: 0, bottom: 4 }}>
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
            stroke="var(--color-gray-300)"
            allowDecimals={false}
          />
          <Tooltip
            wrapperClassName="rounded font-mono text-sm"
            contentStyle={{ backgroundColor: "var(--color-gray-950)", color: "var(--color-white)", border: undefined }}
            labelFormatter={(ts) => `Time : ${formatHour(Number(ts))}`}
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
    </div>
  );
}

