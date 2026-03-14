"use client";

interface NumberPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export default function NumberPad({ value, onChange, onSubmit, disabled }: NumberPadProps) {
  const handlePress = (digit: string) => {
    if (disabled) return;
    if (value.length < 3) {
      onChange(value + digit);
    }
  };

  const handleDelete = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const buttons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["DEL", "0", "GO"],
  ];

  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {buttons.flat().map((btn) => {
        if (btn === "DEL") {
          return (
            <button
              key={btn}
              onClick={handleDelete}
              disabled={disabled}
              className="h-16 rounded-xl bg-gray-200 text-gray-700 text-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              ⌫
            </button>
          );
        }
        if (btn === "GO") {
          return (
            <button
              key={btn}
              onClick={onSubmit}
              disabled={disabled || value.length === 0}
              className="h-16 rounded-xl bg-success text-white text-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
            >
              GO
            </button>
          );
        }
        return (
          <button
            key={btn}
            onClick={() => handlePress(btn)}
            disabled={disabled}
            className="h-16 rounded-xl bg-white text-gray-800 text-2xl font-bold shadow active:scale-95 transition-transform disabled:opacity-50 hover:bg-blue-50"
          >
            {btn}
          </button>
        );
      })}
    </div>
  );
}
