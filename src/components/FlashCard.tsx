"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FlashCardProps {
  first: number;
  second: number;
  answer: string;
  result?: { correct: boolean; correctAnswer: number } | null;
}

const cardColors = [
  "from-blue-400 to-blue-500",
  "from-purple-400 to-purple-500",
  "from-pink-400 to-pink-500",
  "from-green-400 to-green-500",
  "from-orange-400 to-orange-500",
  "from-teal-400 to-teal-500",
];

export default function FlashCard({ first, second, answer, result }: FlashCardProps) {
  const colorIndex = (first + second) % cardColors.length;
  const bgColor = cardColors[colorIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${first}x${second}`}
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: -20 }}
        className={`bg-gradient-to-br ${bgColor} rounded-3xl p-8 shadow-xl w-full max-w-sm mx-auto ${
          result?.correct === false ? "animate-shake" : ""
        }`}
      >
        <div className="text-center text-white">
          <p className="text-lg font-medium opacity-80 mb-2">What is...</p>
          <div className="text-6xl font-bold mb-4">
            {first} × {second}
          </div>
          <div className="text-5xl font-bold min-h-[60px]">
            {result ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={result.correct ? "" : "text-red-200"}
              >
                {result.correct ? (
                  <span>= {result.correctAnswer}</span>
                ) : (
                  <div>
                    <span className="line-through opacity-60">{answer}</span>
                    <span className="ml-3">= {result.correctAnswer}</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <span>= {answer || "?"}</span>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
