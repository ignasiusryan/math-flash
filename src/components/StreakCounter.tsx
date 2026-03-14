"use client";

import { motion } from "framer-motion";

interface StreakCounterProps {
  streak: number;
  stars: number;
}

export default function StreakCounter({ streak, stars }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-6 text-lg font-bold">
      <div className="flex items-center gap-1">
        <motion.span
          key={streak}
          initial={{ scale: 1.5 }}
          animate={{ scale: 1 }}
          className="text-2xl"
        >
          🔥
        </motion.span>
        <motion.span
          key={`s-${streak}`}
          initial={{ scale: 1.4, color: "#ED8936" }}
          animate={{ scale: 1, color: "#1a1a2e" }}
          className="text-xl"
        >
          {streak}
        </motion.span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-2xl">⭐</span>
        <span className="text-xl">{stars}</span>
      </div>
    </div>
  );
}
