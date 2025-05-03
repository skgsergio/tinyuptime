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
        <thead className="bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Monitor Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Success
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Failures
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Last Check
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.map((row: SummaryData, index: number) => (
            <tr key={index} className="hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-100">
                {row.group_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-mono">
                <span className="text-green-400">{row.successful_checks}</span>
                <span className="text-gray-300 text-sm">
                  {" "}
                  (
                  {((row.successful_checks / row.total_checks) * 100).toFixed(
                    1,
                  )}
                  %)
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base font-mono">
                <span className="text-red-400">{row.failing_checks}</span>
                <span className="text-gray-300 text-sm">
                  {" "}
                  ({((row.failing_checks / row.total_checks) * 100).toFixed(1)}
                  %)
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 font-mono">
                {row.total_checks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-300 font-mono">
                {formatDateTime(row.last_check_timestamp)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}
