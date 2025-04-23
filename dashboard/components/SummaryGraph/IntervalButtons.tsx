"use client";

import { useRouter, useSearchParams } from "next/navigation";

const intervals = ["6h", "12h", "1d", "7d", "14d"];

export default function IntervalButtons({ currentInterval }: { currentInterval: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setIntervalParam(interval: string) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("interval", interval);
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="row flex mb-4 justify-end">
      {intervals.map((interval, idx) => {
        let classes = "rounded-none border-r-0";
        if (idx === 0) classes = "rounded-md rounded-r-none border-r-0";
        else if (idx === intervals.length - 1) classes = "rounded-md rounded-l-none";
        return (
          <button
            key={interval}
            onClick={() => setIntervalParam(interval)}
            className={
              `${classes} border border-slate-700 px-3 py-1 font-mono text-sm shadow-md ` +
              (currentInterval === interval
                ? "bg-gray-800 text-white"
                : "bg-gray-900 hover:bg-gray-800 hover:shadow-lg")
            }
            aria-pressed={currentInterval === interval}
          >
            {interval}
          </button>
        );
      })}
    </div>
  );
}