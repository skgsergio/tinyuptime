"use client";

import { useState, useEffect } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceArea,
} from "recharts";

import {
  formatDateTime,
  formatHour,
  formatDateTimeRange,
} from "@/lib/dateUtils";
import { useTimer } from "@/contexts/TimerContext";

import IntervalButtons from "./IntervalButtons";
import Widget from "./Widget";

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

const CLASS_COLORS: {
  [key: string]: { stroke: string; fill: string; textClass: string };
} = {
  info: {
    stroke: "var(--color-blue-700)",
    fill: "var(--color-blue-800)",
    textClass: "text-blue-400",
  },
  success: {
    stroke: "var(--color-green-700)",
    fill: "var(--color-green-800)",
    textClass: "text-green-400",
  },
  warning: {
    stroke: "var(--color-yellow-700)",
    fill: "var(--color-yellow-800)",
    textClass: "text-yellow-400",
  },
  error: {
    stroke: "var(--color-red-700)",
    fill: "var(--color-red-800)",
    textClass: "text-red-400",
  },
};

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

export function areMarkerTimeseriesPointsEqual(
  m1: MarkerTimeseriesPointData,
  m2: MarkerTimeseriesPointData,
): boolean {
  return (
    m1.start === m2.start &&
    m1.end === m2.end &&
    m1.name === m2.name &&
    m1.class === m2.class
  );
}

export function uniqueIdMarkerTimeseriesPoint(
  m: MarkerTimeseriesPointData,
): string {
  return `${m.start}-${m.end}-${m.class}`;
}

export default function SummaryGraph() {
  const [data, setData] = useState<SummaryTimeseriesPointData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const [currentInterval, setIntervalParam] = useState("1d");
  const [markers, setMarkers] = useState<MarkerTimeseriesPointData[]>([]);
  const { reloadDate } = useTimer();

  useEffect(() => {
    const fetchData = () => {
      fetch(
        `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/summaries_timeseries.json?interval=${currentInterval}&token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch summary timeseries data");
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
        `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/markers_timeseries.json?interval=${currentInterval}&token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch markers timeseries data");
          }
          return response.json();
        })
        .then((json) => {
          // Ensure markers are unique
          const uniqueMarkers = json.data.filter(
            (marker: MarkerTimeseriesPointData, index: number) => {
              return (
                json.data.findIndex((m: MarkerTimeseriesPointData) =>
                  areMarkerTimeseriesPointsEqual(m, marker),
                ) === index
              );
            },
          );

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

  // Process data for recharts
  const chartSeries = new Set<string>();
  const chartData: {
    [key: number]: { timestamp: number; [key: string]: number };
  } = {};

  data.forEach((point: SummaryTimeseriesPointData) => {
    if (!chartData[point.timestamp]) {
      chartData[point.timestamp] = { timestamp: point.timestamp };
    }

    chartSeries.add(point.group_name);

    chartData[point.timestamp][point.group_name] = point.failing_checks;
  });

  // Create a list of unique markers by start and end date
  const uniqueMarkers: {
    [key: string]: {
      start: number;
      end: number;
      class: string;
      name: string[];
    };
  } = {};
  markers.forEach((marker) => {
    const key = uniqueIdMarkerTimeseriesPoint(marker);

    if (uniqueMarkers[key]) {
      uniqueMarkers[key].name.push(marker.name);
    } else {
      uniqueMarkers[key] = {
        start: marker.start,
        end: marker.end,
        class: marker.class,
        name: [marker.name],
      };
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Widget className="md:col-span-2">
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Failing Checks Over Time
        </h3>
        <IntervalButtons
          currentInterval={currentInterval}
          setIntervalParam={setIntervalParam}
        />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={Object.values(chartData)} margin={{ right: 25 }}>
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
            <CartesianGrid stroke="var(--color-gray-700)" strokeDasharray="4" />
            <Tooltip
              wrapperClassName="rounded font-mono text-sm"
              labelClassName="font-bold pb-2"
              contentStyle={{
                backgroundColor: "var(--color-gray-950)",
                color: "var(--color-white)",
                border: undefined,
              }}
              labelFormatter={(ts) => formatDateTime(ts)}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend
              iconType="line"
              formatter={(value, entry, idx) => (
                <span
                  className="text-sm font-mono"
                  style={{ color: GRAPH_COLORS[idx % GRAPH_COLORS.length] }}
                >
                  {value}
                </span>
              )}
            />
            {Object.keys(uniqueMarkers).map((key, idx) => (
              <ReferenceArea
                key={key}
                x1={uniqueMarkers[key].start}
                x2={uniqueMarkers[key].end}
                stroke={
                  CLASS_COLORS[uniqueMarkers[key].class].stroke ||
                  "var(--color-slate-700)"
                }
                strokeWidth={1}
                strokeDasharray="5"
                strokeOpacity={0.75}
                fill={
                  CLASS_COLORS[uniqueMarkers[key].class].fill ||
                  "var(--color-slate-800)"
                }
                fillOpacity={0.1}
                ifOverflow="hidden"
                label={{
                  value: idx + 1,
                  position: "insideTop",
                  className: `text-xs font-mono`,
                  fill: CLASS_COLORS[uniqueMarkers[key].class].stroke,
                }}
              />
            ))}

            {Array.from(chartSeries).map((group, idx) => (
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
        {Object.entries(uniqueMarkers).length > 0 ? (
          Object.keys(uniqueMarkers).map((key, idx) => (
            <div key={key} className="text-sm font-mono mb-6">
              <div className={CLASS_COLORS[uniqueMarkers[key].class].textClass}>
                <span className="font-semibold">[#{idx + 1}]</span>{" "}
                {formatDateTimeRange(
                  uniqueMarkers[key].start,
                  uniqueMarkers[key].end,
                )}
              </div>
              <ul className="pl-8 pt-1 list-disc">
                {uniqueMarkers[key].name.map((name, nameIdx) => (
                  <li key={nameIdx}>{name}</li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p>No markers found</p>
        )}
      </Widget>
    </div>
  );
}
