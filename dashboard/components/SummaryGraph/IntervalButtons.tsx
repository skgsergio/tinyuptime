"use client";

import { useState } from "react";

import { useCheats } from "@/lib/cheats";

export default function IntervalButtons({
  intervals,
  hidden_intervals,
  defaultInterval,
  currentInterval,
  setIntervalParam,
}: {
  intervals: string[];
  hidden_intervals: string[];
  defaultInterval: string;
  currentInterval: string;
  setIntervalParam: (interval: string) => void;
}) {
  const [cheatsEnabled, setCheatsEnabled] = useState(false);

  useCheats(() => {
    setCheatsEnabled(!cheatsEnabled);
  });

  const _intervals = intervals.slice();
  if (cheatsEnabled) _intervals.push(...hidden_intervals);

  if (!_intervals.includes(currentInterval)) {
    currentInterval = defaultInterval;
  }

  return (
    <div className="row flex mb-4 justify-end">
      {_intervals.map((interval, idx) => {
        let classes = "rounded-none border-r-0";
        if (idx === 0) classes = "rounded-md rounded-r-none border-r-0";
        else if (idx === _intervals.length - 1)
          classes = "rounded-md rounded-l-none";
        return (
          <button
            key={interval}
            onClick={() => setIntervalParam(interval)}
            className={
              `${classes} border border-slate-700 px-3 py-1 font-mono text-sm shadow-md ` +
              (currentInterval === interval
                ? "bg-gray-800 text-white"
                : "bg-gray-900 hover:bg-gray-800 hover:shadow-lg transition-all cursor-pointer")
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
