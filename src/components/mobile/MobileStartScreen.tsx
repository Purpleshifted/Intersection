"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameContext, type Difficulty } from "@/context/GameContext";
import DifficultySelector from "@/components/intro/DifficultySelector";

const MobileStartScreen = () => {
  const router = useRouter();
  const { setDisplayName, setDifficulty } = useGameContext();
  const [name, setName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const handleEnter = () => {
    if (!selectedDifficulty) {
      setDifficulty('easy');
    } else {
      setDifficulty(selectedDifficulty);
    }
    setDisplayName(name.trim() || "Player");
    // Start screen을 숨기고 게임 시작
    router.push("/mobile");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-12 py-32 text-white">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl vintage-serif">
            Enter the space
          </h1>
        </div>

        <div className="space-y-4">
          <p className="text-sm leading-normal text-white/70 font-normal vintage-serif">
            The sphere at the center is yours.
            <br />
            <br />
            Touch and hold the space
            <br />
            to move it in that direction.
            <br />
            <br />
            Listen carefully —
            <br />
            sound will guide you toward encounters.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full flex-col gap-2">
            <label
              className="text-sm font-normal text-white/60 vintage-serif"
              htmlFor="displayName"
            >
              your name
            </label>
            <input
              id="displayName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Voyager-123"
              className="rounded-lg border border-white/30 bg-white px-4 py-3 text-sm font-normal text-gray-800 outline-none transition-colors focus:border-white/50 vintage-serif w-full"
            />
          </div>

          <div className="w-full">
            <DifficultySelector
              onSelect={setSelectedDifficulty}
              selected={selectedDifficulty}
            />
          </div>

          <button
            className="w-full rounded-lg border border-white bg-transparent px-12 py-3 text-sm font-normal text-white transition-all duration-300 hover:border-white/80 hover:text-white/90 active:scale-[0.98] vintage-serif disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleEnter}
            disabled={!selectedDifficulty}
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileStartScreen;

