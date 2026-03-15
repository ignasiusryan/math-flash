"use client";

import { useState, useEffect } from "react";
import ChildSelector from "@/components/ChildSelector";
import TablePicker from "@/components/TablePicker";
import GameScreen from "@/components/GameScreen";

interface Child {
  id: string;
  name: string;
}

export default function PlayPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    const res = await fetch("/api/children");
    const data = await res.json();
    setChildren(data.children || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleAddChild = async (name: string) => {
    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.child) {
      setChildren((prev) => [...prev, data.child]);
    }
  };

  const handleSelectChild = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    if (child) setSelectedChild(child);
  };

  const handleSelectTable = (table: number | null) => {
    setSelectedTable(table);
  };

  const handleBackToChildren = () => {
    setSelectedChild(null);
    setSelectedTable(undefined);
  };

  const handleBackToTables = () => {
    setSelectedTable(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  // Step 3: Game
  if (selectedChild && selectedTable !== undefined) {
    return (
      <GameScreen
        childId={selectedChild.id}
        childName={selectedChild.name}
        table={selectedTable}
        onBack={handleBackToTables}
      />
    );
  }

  // Step 2: Table picker
  if (selectedChild) {
    return (
      <TablePicker
        childName={selectedChild.name}
        onSelect={handleSelectTable}
        onBack={handleBackToChildren}
      />
    );
  }

  // Step 1: Child selector
  return (
    <ChildSelector
      children={children}
      onSelect={handleSelectChild}
      onAddChild={handleAddChild}
    />
  );
}
