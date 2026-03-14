"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StarRewardProps {
  show: boolean;
  correct: boolean;
  isMilestone?: boolean;
}

export default function StarReward({ show, correct, isMilestone }: StarRewardProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          {correct ? (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5, type: "spring" }}
                className={`text-8xl ${isMilestone ? "text-9xl" : ""}`}
              >
                {isMilestone ? "🌟" : "⭐"}
              </motion.div>
              {isMilestone && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl font-bold text-purple mt-4"
                >
                  Amazing streak! +5 bonus stars!
                </motion.p>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-6 shadow-xl text-center"
            >
              <p className="text-2xl font-bold text-warning">Almost!</p>
              <p className="text-lg text-gray-500 mt-1">Keep trying, you got this!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
