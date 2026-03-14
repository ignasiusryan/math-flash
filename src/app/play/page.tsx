"use client";

import { useState, useEffect } from "react";
import ChildSelector from "@/components/ChildSelector";
import GameScreen from "@/components/GameScreen";

interface Child {
  id: string;
  name: string;
}

export default function PlayPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
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

  const handleSelect = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    if (child) setSelectedChild(child);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (selectedChild) {
    return (
      <GameScreen
        childId={selectedChild.id}
        childName={selectedChild.name}
        onBack={() => setSelectedChild(null)}
      />
    );
  }

  return (
    <ChildSelector
      children={children}
      onSelect={handleSelect}
      onAddChild={handleAddChild}
    />
  );
}
