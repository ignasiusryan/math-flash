"use client";

import { getFactKey } from "@/lib/facts";

interface FactData {
  factKey: string;
  bucket: number;
  correctCount: number;
  wrongCount: number;
}

interface ProgressGridProps {
  factStates: FactData[];
}

const bucketColors = [
  "bg-red-300",    // 0 - struggling
  "bg-orange-300", // 1 - learning
  "bg-yellow-300", // 2 - familiar
  "bg-green-300",  // 3 - good
  "bg-green-500",  // 4 - mastered
];

const bucketBg = [
  "bg-gray-100",   // not started
];

export default function ProgressGrid({ factStates }: ProgressGridProps) {
  const factMap = new Map<string, FactData>();
  factStates.forEach((f) => factMap.set(f.factKey, f));

  const getCellColor = (row: number, col: number) => {
    const key = getFactKey(row, col);
    const fact = factMap.get(key);
    if (!fact || (fact.correctCount === 0 && fact.wrongCount === 0)) {
      return "bg-gray-100 text-gray-400";
    }
    return `${bucketColors[fact.bucket]} text-white`;
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-11 gap-1 text-center text-sm font-bold">
        {/* Header row */}
        <div className="text-gray-400">×</div>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={`h-${i}`} className="text-primary">
            {i + 1}
          </div>
        ))}

        {/* Grid rows */}
        {Array.from({ length: 10 }, (_, row) => (
          <>
            <div key={`r-${row}`} className="text-primary flex items-center justify-center">
              {row + 1}
            </div>
            {Array.from({ length: 10 }, (_, col) => {
              const key = getFactKey(row + 1, col + 1);
              const fact = factMap.get(key);
              return (
                <div
                  key={`${row}-${col}`}
                  className={`aspect-square rounded flex items-center justify-center text-xs font-medium ${getCellColor(row + 1, col + 1)}`}
                  title={`${row + 1} × ${col + 1} = ${(row + 1) * (col + 1)}${fact ? ` | Bucket ${fact.bucket}` : ""}`}
                >
                  {(row + 1) * (col + 1)}
                </div>
              );
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-3 mt-4 text-xs font-medium">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100"></span> New</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-300"></span> Hard</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-300"></span> Learning</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500"></span> Mastered</span>
      </div>
    </div>
  );
}
