"use client";

import { useEffect, useState } from "react";

import { useReload } from "@/contexts/TimerContext";

import { formatDateTime } from "@/lib/dateUtils";
import Container from "./Container";

export interface ErrorsData {
  group_name: string;
  failing_checks: number;
  error: string;
  last_error_timestamp: number;
}

export default function ErrorsTable() {
  const [data, setData] = useState<ErrorsData[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);
  const { reloadDate } = useReload();

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
        setFirstLoad(false);
      })
      .catch((err) => {
        setError(err.message);
        setFirstLoad(false);
      });
  }, [reloadDate]);

  if (firstLoad) return <Container className="animate-pulse"></Container>;
  if (error) return <Container className="p-6 text-red-400">{error}</Container>;
  if (!data) return <Container className="p-6">No data available</Container>;

  return (
    <Container className="scrollbar-thin overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>
              Monitor Group
            </th>
            <th>
              Failing Checks
            </th>
            <th>
              Error
            </th>
            <th>
              Last Error Time
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: ErrorsData, index: number) => (
            <tr key={index}>
              <td>
                {row.group_name}
              </td>
              <td>
                {row.failing_checks}
              </td>
              <td className="overflow-hidden text-ellipsis max-w-[750px]">
                {row.error}
              </td>
              <td>
                {formatDateTime(row.last_error_timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}
