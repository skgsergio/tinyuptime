"use client";

import WidgetCapsule from "./WidgetCapsule";

export default function Widget({
  title,
  value,
  detail,
  valueColorClass,
}: {
  title: string;
  value: string;
  detail?: string;
  valueColorClass?: string;
}) {
  return (
    <WidgetCapsule>
      <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 font-mono">
        <p
          className={`text-3xl font-bold ${valueColorClass || "text-gray-300"}`}
        >
          {value}
        </p>
        {detail && <p className="text-base text-gray-300">{detail}</p>}
      </div>
    </WidgetCapsule>
  );
}
