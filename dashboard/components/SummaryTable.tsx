'use client';

import { useSummary } from '@/contexts/SummaryContext';

export default function SummaryTable() {
  const { data, loading, error } = useSummary();

  if (loading) {
    return <div className="text-center p-4 text-gray-300">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400 p-4">Error: {error}</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Monitor Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Success
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Failures
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Last Check
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900 dark:text-gray-100">
                {row.group_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base">
                <span className="text-green-600 dark:text-green-400">{row.successful_checks}</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm"> ({(row.successful_checks / row.total_checks * 100).toFixed(1)}%)</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base">
                <span className="text-red-600 dark:text-red-400">{row.failing_checks}</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm"> ({(row.failing_checks / row.total_checks * 100).toFixed(1)}%)</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 dark:text-gray-300">
                {row.total_checks}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-base text-gray-700 dark:text-gray-300">
                {new Date(row.last_check_timestamp * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 