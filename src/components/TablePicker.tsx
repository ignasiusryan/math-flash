"use client";

interface TablePickerProps {
  childName: string;
  onSelect: (table: number | null) => void;
  onBack: () => void;
}

export default function TablePicker({ childName, onSelect, onBack }: TablePickerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <h1 className="text-3xl font-bold text-primary mb-2">Hi {childName}!</h1>
      <p className="text-gray-500 mb-8">What do you want to practice?</p>

      {/* All tables button */}
      <button
        onClick={() => onSelect(null)}
        className="w-full max-w-sm bg-primary text-white text-xl font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 mb-6"
      >
        All Tables (Mixed)
      </button>

      <p className="text-gray-400 text-sm font-medium mb-4">Or pick a specific table:</p>

      {/* Table grid */}
      <div className="grid grid-cols-5 gap-3 max-w-sm w-full">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => onSelect(num)}
            className="aspect-square rounded-xl bg-white shadow hover:shadow-lg transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
          >
            <span className="text-2xl font-bold text-gray-800">{num}</span>
            <span className="text-xs text-gray-400">× table</span>
          </button>
        ))}
      </div>

      <button onClick={onBack} className="mt-8 text-gray-400 font-medium">
        ← Back
      </button>
    </div>
  );
}
