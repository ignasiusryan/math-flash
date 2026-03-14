"use client";

import { useState } from "react";

interface Child {
  id: string;
  name: string;
}

interface ChildSelectorProps {
  children: Child[];
  onSelect: (childId: string) => void;
  onAddChild: (name: string) => void;
}

export default function ChildSelector({ children, onSelect, onAddChild }: ChildSelectorProps) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    if (newName.trim()) {
      onAddChild(newName.trim());
      setNewName("");
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-purple-50">
      <h1 className="text-4xl font-bold text-primary mb-2">Who&apos;s playing today?</h1>
      <p className="text-gray-500 mb-8">Select a player to start</p>

      <div className="grid grid-cols-2 gap-4 max-w-md w-full mb-6">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-center"
          >
            <div className="text-5xl mb-3">
              {["😊", "😄", "🤩", "😎", "🥳", "🤗"][children.indexOf(child) % 6]}
            </div>
            <p className="text-xl font-bold text-gray-800">{child.name}</p>
          </button>
        ))}

        {/* Add child button */}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-primary hover:bg-white transition-all text-center"
          >
            <div className="text-5xl mb-3">➕</div>
            <p className="text-lg font-medium text-gray-500">Add Player</p>
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-white rounded-2xl p-6 shadow-lg max-w-sm w-full">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Enter name..."
            autoFocus
            className="w-full text-xl text-center font-medium border-2 border-gray-200 rounded-xl p-3 mb-4 focus:border-primary focus:outline-none"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setAdding(false)}
              className="flex-1 py-3 rounded-xl bg-gray-100 font-bold text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!newName.trim()}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-bold disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
