"use client";

import { useState } from "react";

export type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySelectorProps {
  onSelect: (difficulty: Difficulty) => void;
  selected?: Difficulty | null;
}

const DifficultySelector = ({ onSelect, selected }: DifficultySelectorProps) => {
  const difficulties: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Easy', description: 'C Major 주요 코드' },
    { value: 'medium', label: 'Medium', description: '1단계 전조 필요' },
    { value: 'hard', label: 'Hard', description: '2단계 이상 전조 필요' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-normal text-white/60 vintage-serif">
        난이도 선택
      </label>
      <div className="flex flex-col gap-2">
        {difficulties.map((diff) => (
          <button
            key={diff.value}
            onClick={() => onSelect(diff.value)}
            className={`rounded-lg border px-4 py-2 text-sm font-normal transition-all vintage-serif text-left ${
              selected === diff.value
                ? 'border-white bg-white/10 text-white'
                : 'border-white/30 bg-transparent text-white/70 hover:border-white/50 hover:text-white/90'
            }`}
          >
            <div className="font-medium">{diff.label}</div>
            <div className="text-xs text-white/50">{diff.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;
