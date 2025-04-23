'use client';

import { useState } from 'react';
import StatusBarGraph from './StatusBarGraph';
import { FirstIcon, PreviousIcon, NextIcon, LastIcon } from '@/components/Icons/Pagination';
import { LastHourData } from '@/lib/fetchData';


export default function PaginatedWidgets({ checkStatuses }: { checkStatuses: LastHourData[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 12;

  const filteredChecks = checkStatuses.filter(check =>
    check.check_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredChecks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentChecks = filteredChecks.slice(startIndex, endIndex);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search checks..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-gray-600 focus:outline-none"
        />
      </div>
      {filteredChecks.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          No checks found matching &quot;{searchQuery}&quot;
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentChecks.map((check) => {
              const lastStatus = check.success_statuses[0];

              return (
                <div
                  key={check.check_name}
                  className={`p-4 rounded-lg ${
                    lastStatus ? 'bg-green-900' : 'bg-red-900'
                  }`}
                >
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {check.check_name}
                  </h3>
                  <StatusBarGraph
                    successStatuses={check.success_statuses}
                    timestamps={check.timestamps}
                  />
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="First page"
              >
                <FirstIcon />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <PreviousIcon />
              </button>
              <span className="text-white">
                Page <span className="font-mono">{currentPage}</span> of <span className="font-mono">{totalPages}</span>
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <NextIcon />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Last page"
              >
                <LastIcon />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}