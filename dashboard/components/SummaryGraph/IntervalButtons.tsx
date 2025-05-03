"use client";

import { useState } from "react";

import { useCheats } from "@/lib/cheats";

const INTERVALS = ["6h", "12h", "1d", "7d"];

export default function IntervalButtons({
  currentInterval,
  setIntervalParam,
}: {
  currentInterval: string;
  setIntervalParam: (interval: string) => void;
}) {
  const [cheatsEnabled, setCheatsEnabled] = useState(false);

  useCheats(() => {
    setCheatsEnabled(!cheatsEnabled);
  });

  const intervals = INTERVALS.slice();
  if (cheatsEnabled) intervals.push("14d");

  return (
    <div className="row flex mb-4 justify-end">
      {intervals.map((interval, idx) => {
        let classes = "rounded-none border-r-0";
        if (idx === 0) classes = "rounded-md rounded-r-none border-r-0";
        else if (idx === intervals.length - 1)
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
