"use client";

import { useEffect, useState } from "react";

const candyEmojis = ["🍬", "🍫", "🍭", "🍪", "🧁", "🎂", "🍩", "🍰"];

interface Candy {
  id: number;
  emoji: string;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  direction: "up" | "down";
}

export function FloatingCandies() {
  const [candies, setCandies] = useState<Candy[]>([]);

  useEffect(() => {
    const newCandies: Candy[] = [];
    for (let i = 0; i < 20; i++) {
      newCandies.push({
        id: i,
        emoji: candyEmojis[Math.floor(Math.random() * candyEmojis.length)],
        left: Math.random() * 100,
        animationDuration: 15 + Math.random() * 20,
        animationDelay: Math.random() * 10,
        size: 16 + Math.random() * 24,
        direction: Math.random() > 0.5 ? "up" : "down",
      });
    }
    setCandies(newCandies);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {candies.map((candy) => (
        <div
          key={candy.id}
          className="absolute"
          style={{
            left: `${candy.left}%`,
            fontSize: `${candy.size}px`,
            animation: `float-${candy.direction} ${candy.animationDuration}s linear infinite`,
            animationDelay: `${candy.animationDelay}s`,
            opacity: 0.4,
            top: candy.direction === "up" ? "100%" : "-10%",
          }}
        >
          {candy.emoji}
        </div>
      ))}
      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
          }
        }
        @keyframes float-down {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          100% {
            transform: translateY(120vh) rotate(-360deg);
          }
        }
      `}</style>
    </div>
  );
}
