"use client";

import { useState, useEffect } from "react";

import { useTimer } from "@/contexts/TimerContext";

import { formatDateTime } from "@/lib/dateUtils";
import Container from "./Container";

export interface ErrorsData {
  group_name: string;
  failing_checks: number;
  error: string;
  last_error_timestamp: number;
}

export default function SummaryTable() {
  const { reloadDate } = useTimer();

  const [data, setData] = useState<ErrorsData[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [firstLoad, setFirstLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_HOST}/v0/pipes/current_errors.json?token=${process.env.NEXT_PUBLIC_TINYBIRD_TINYUPTIME_PUBLIC_DASHBOARD_TOKEN}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch current errors data");
        }
        return response.json();
      })
      .then((json) => {
        setData(json.data);
        setFirstLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setFirstLoading(false);
      });
  }, [reloadDate]);

  if (firstLoad) return <Container className="animate-pulse"></Container>;
  if (error) return <Container className="p-6 text-red-400">{error}</Container>;
  if (!data)
    return <Container className="p-6">No data available</Container>;

  return (
    <Container className="scrollbar-thin overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Monitor Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Failing Checks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Error
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Last Error Time
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.map((row: ErrorsData, index: number) => (
            <tr key={index} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-100">
                {row.group_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-mono">
                {row.failing_checks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-mono overflow-hidden text-ellipsis max-w-[750px]">
                {row.error}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-mono">
                {formatDateTime(row.last_error_timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}
