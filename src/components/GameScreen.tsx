"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import FlashCard from "./FlashCard";
import NumberPad from "./NumberPad";
import StreakCounter from "./StreakCounter";
import StarReward from "./StarReward";
import Link from "next/link";
import { playCorrectSound, playWrongSound, playMilestoneSound } from "@/lib/sounds";

interface GameScreenProps {
  childId: string;
  childName: string;
  table?: number | null;
  onBack: () => void;
}

interface CardData {
  factKey: string;
  first: number;
  second: number;
}

interface AnswerResult {
  correct: boolean;
  correctAnswer: number;
  newStreak: number;
  starsEarned: number;
  totalStars: number;
  isMilestone: boolean;
  tooSlow: boolean;
}

export default function GameScreen({ childId, childName, table, onBack }: GameScreenProps) {
  const [card, setCard] = useState<CardData | null>(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [streak, setStreak] = useState(0);
  const [stars, setStars] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cardsPlayed, setCardsPlayed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [correctionAnswer, setCorrectionAnswer] = useState("");
  const recentRef = useRef<string[]>([]);
  const startTimeRef = useRef<number>(0);

  const fetchNextCard = useCallback(async () => {
    setLoading(true);
    const recentParam = recentRef.current.slice(-5).join(",");
    let url = `/api/next-card?childId=${childId}&recent=${recentParam}`;
    if (table) url += `&table=${table}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.done) {
      setCard(null);
    } else {
      setCard({ factKey: data.factKey, first: data.first, second: data.second });
      recentRef.current.push(data.factKey);
      if (recentRef.current.length > 10) recentRef.current.shift();
    }
    setLoading(false);
    startTimeRef.current = Date.now();
  }, [childId, table]);

  useEffect(() => {
    fetchNextCard();
  }, [fetchNextCard]);

  const advanceToNext = useCallback(() => {
    setResult(null);
    setAnswer("");
    setCorrectionMode(false);
    setCorrectionAnswer("");
    fetchNextCard();
  }, [fetchNextCard]);

  const handleSubmit = async () => {
    if (!card || !answer || result) return;

    const responseMs = Date.now() - startTimeRef.current;

    const res = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        childId,
        factKey: card.factKey,
        presented: `${card.first} × ${card.second}`,
        answer: Number(answer),
        responseMs,
      }),
    });

    const data: AnswerResult = await res.json();
    setResult(data);
    setStreak(data.newStreak);
    setStars(data.totalStars);
    setCardsPlayed((c) => c + 1);
    if (data.correct) setCorrectCount((c) => c + 1);

    // Play sound effect
    if (data.isMilestone) {
      playMilestoneSound();
    } else if (data.correct) {
      playCorrectSound();
    } else {
      playWrongSound();
    }

    // Show reward animation
    setShowReward(true);
    setTimeout(() => setShowReward(false), data.correct ? 800 : 1200);

    if (data.correct) {
      // Auto-advance after delay
      setTimeout(advanceToNext, data.tooSlow ? 2000 : 1200);
    } else {
      // Wrong answer: show correct answer briefly, then enter correction mode
      setTimeout(() => {
        setCorrectionMode(true);
      }, 1800);
    }
  };

  const handleCorrectionSubmit = () => {
    if (!result || !correctionMode) return;
    if (Number(correctionAnswer) === result.correctAnswer) {
      playCorrectSound();
      advanceToNext();
    } else {
      // Wrong again - shake and clear
      setCorrectionAnswer("");
      playWrongSound();
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (correctionMode) {
        if (e.key >= "0" && e.key <= "9" && correctionAnswer.length < 3) {
          setCorrectionAnswer((a) => a + e.key);
        } else if (e.key === "Backspace") {
          setCorrectionAnswer((a) => a.slice(0, -1));
        } else if (e.key === "Enter" && correctionAnswer.length > 0) {
          handleCorrectionSubmit();
        }
        return;
      }

      if (result) return;
      if (e.key >= "0" && e.key <= "9" && answer.length < 3) {
        setAnswer((a) => a + e.key);
      } else if (e.key === "Backspace") {
        setAnswer((a) => a.slice(0, -1));
      } else if (e.key === "Enter" && answer.length > 0) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, result, correctionMode, correctionAnswer]);

  if (loading && !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  // Session summary after 20 cards
  if (cardsPlayed >= 20 && !card) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-purple-50">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-primary mb-4">Great Job, {childName}!</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-primary">{cardsPlayed}</p>
              <p className="text-sm text-gray-500">Cards</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-success">
                {cardsPlayed > 0 ? Math.round((correctCount / cardsPlayed) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500">Correct</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-warning">🔥 {streak}</p>
              <p className="text-sm text-gray-500">Best Streak</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-yellow-500">⭐ {stars}</p>
              <p className="text-sm text-gray-500">Total Stars</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setCardsPlayed(0); setCorrectCount(0); fetchNextCard(); }}
              className="bg-primary text-white text-xl font-bold py-3 px-8 rounded-xl"
            >
              Play Again!
            </button>
            <button onClick={onBack} className="text-gray-500 font-medium">
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-gray-400 text-lg font-medium">
          ← Back
        </button>
        <div className="flex items-center gap-3">
          {table && (
            <span className="bg-purple-100 text-purple-700 text-sm font-bold px-3 py-1 rounded-full">
              {table}s table
            </span>
          )}
          <StreakCounter streak={streak} stars={stars} />
        </div>
      </div>

      {/* Card count */}
      <div className="text-center text-sm text-gray-400 font-medium">
        Card {cardsPlayed + 1} / 20
      </div>

      {/* Flash Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-8">
        {card && (
          <FlashCard
            first={card.first}
            second={card.second}
            answer={correctionMode ? correctionAnswer : answer}
            result={correctionMode ? null : (result ? { correct: result.correct, correctAnswer: result.correctAnswer, tooSlow: result.tooSlow } : null)}
            correctionMode={correctionMode}
          />
        )}

        {/* Number Pad */}
        <NumberPad
          value={correctionMode ? correctionAnswer : answer}
          onChange={correctionMode ? setCorrectionAnswer : setAnswer}
          onSubmit={correctionMode ? handleCorrectionSubmit : handleSubmit}
          disabled={!!result && !correctionMode}
        />
      </div>

      {/* Progress link */}
      <div className="text-center py-4">
        <Link href={`/progress?childId=${childId}`} className="text-primary font-medium text-sm">
          View Progress Grid →
        </Link>
      </div>

      {/* Reward overlay */}
      <StarReward
        show={showReward}
        correct={result?.correct ?? false}
        isMilestone={result?.isMilestone}
      />
    </div>
  );
}
