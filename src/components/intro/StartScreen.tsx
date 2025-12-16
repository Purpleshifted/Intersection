"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameContext, type Difficulty } from "@/context/GameContext";
import type { Mode } from "@/types/game";
import DifficultySelector from "./DifficultySelector";

const StartScreen = () => {
  const router = useRouter();
  const { setMode, setDisplayName, setDifficulty } = useGameContext();
  const [name, setName] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const handleEnter = (mode: Mode) => {
    if (!selectedDifficulty) {
      // 난이도가 선택되지 않았으면 기본값으로 'easy' 사용
      setDifficulty('easy');
    } else {
      setDifficulty(selectedDifficulty);
    }
    setMode(mode);
    setDisplayName(name.trim());
    router.push(mode === "personal" ? "/mobile" : "/global");
  };

  return (
    <div className="flex flex-col gap-8 text-white">
      <div className="space-y-6">
        <h1 className="text-5xl font-bold leading-tight sm:text-6xl md:text-7xl vintage-serif">
          Intersection
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
        <div className="flex flex-col gap-2">
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
            className="rounded-lg border border-white/30 bg-white px-12 py-3 text-sm font-normal text-gray-800 outline-none transition-colors focus:border-white/50 vintage-serif w-[200px]"
          />
        </div>

        <div className="w-[200px]">
          <DifficultySelector
            onSelect={setSelectedDifficulty}
            selected={selectedDifficulty}
          />
        </div>

        <div className="flex flex-col gap-3 w-[200px]">
          <button
            className="rounded-lg border border-white bg-transparent px-12 py-3 text-sm font-normal text-white transition-all duration-300 hover:border-white/80 hover:text-white/90 active:scale-[0.98] vintage-serif disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleEnter("personal")}
            disabled={!selectedDifficulty}
          >
            Enter the space
          </button>
          <button
            className="rounded-lg border border-white/30 bg-white/10 px-12 py-3 text-sm font-normal text-white/80 transition-all duration-300 hover:border-white/50 hover:text-white active:scale-[0.98] vintage-serif disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleEnter("global")}
            disabled={!selectedDifficulty}
          >
            Global view
          </button>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <p className="text-xs font-extralight italic text-white/40 tracking-widest vintage-serif">
          &quot;Across the sea of space, the stars are other suns.&quot; - Carl
          Sagan
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
