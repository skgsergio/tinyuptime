"use client";

import { SummaryData, useSummaryData } from "@/contexts/SummaryDataContext";
import { formatDateTime } from "@/lib/dateUtils";
import Container from "./Container";

export default function SummaryTable() {
  const { data, firstLoad, error } = useSummaryData();

  if (firstLoad) return <Container className="animate-pulse"></Container>;
  if (error) return <Container className="p-6 text-red-400">{error}</Container>;
  if (!data || data.length === 0)
    return <Container className="p-6">No data available</Container>;

  return (
    <Container className="scrollbar-thin overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th>Monitor Group</th>
            <th>Success</th>
            <th>Failures</th>
            <th>Total</th>
            <th>Last Check</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: SummaryData, index: number) => (
            <tr key={index}>
              <td>{row.group_name}</td>
              <td>
                <span
                  className={
                    row.successful_checks !== 0
                      ? "text-green-400"
                      : "text-gray-300"
                  }
                >
                  {row.successful_checks}
                </span>
                <span className="text-gray-300 text-sm">
                  {" "}
                  (
                  {((row.successful_checks / row.total_checks) * 100).toFixed(
                    1,
                  )}
                  %)
                </span>
              </td>
              <td>
                <span
                  className={
                    row.failing_checks !== 0 ? "text-red-400" : "text-gray-300"
                  }
                >
                  {row.failing_checks}
                </span>
                <span className="text-gray-300 text-sm">
                  {" "}
                  ({((row.failing_checks / row.total_checks) * 100).toFixed(1)}
                  %)
                </span>
              </td>
              <td>
                {row.total_checks}
              </td>
              <td>
                {formatDateTime(row.last_check_timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}
