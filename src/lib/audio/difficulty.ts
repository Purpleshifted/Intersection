/**
 * 난이도 시스템
 * C Major 기준으로 각 음의 난이도 분류
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface NoteDifficulty {
  note: string;
  difficulty: Difficulty;
  description: string;
  directModulationFromC: boolean;
  requiredSteps: number;
}

const NOTE_DIFFICULTIES: Record<string, NoteDifficulty> = {
  // 쉬움 - C Major의 주요 코드
  C: {
    note: 'C',
    difficulty: 'easy',
    description: '토닉 - 가장 쉬움',
    directModulationFromC: true,
    requiredSteps: 0,
  },
  G: {
    note: 'G',
    difficulty: 'easy',
    description: '도미넌트 - 직접 전조 가능',
    directModulationFromC: true,
    requiredSteps: 0,
  },
  F: {
    note: 'F',
    difficulty: 'easy',
    description: '서브도미넌트 - 직접 전조 가능',
    directModulationFromC: true,
    requiredSteps: 0,
  },
  Am: {
    note: 'Am',
    difficulty: 'easy',
    description: '상대적 마이너 - 직접 전조 가능',
    directModulationFromC: true,
    requiredSteps: 0,
  },
  Em: {
    note: 'Em',
    difficulty: 'easy',
    description: 'G의 상대적 마이너',
    directModulationFromC: true,
    requiredSteps: 0,
  },

  // 보통 - 1단계 전조 필요
  D: {
    note: 'D',
    difficulty: 'medium',
    description: '슈퍼토닉 - 1단계 필요',
    directModulationFromC: false,
    requiredSteps: 1,
  },
  A: {
    note: 'A',
    difficulty: 'medium',
    description: '서브미디언트 - 1단계 필요',
    directModulationFromC: false,
    requiredSteps: 1,
  },
  E: {
    note: 'E',
    difficulty: 'medium',
    description: '미디언트 - 1단계 필요',
    directModulationFromC: false,
    requiredSteps: 1,
  },
  Bm: {
    note: 'Bm',
    difficulty: 'medium',
    description: '리드 톤 마이너 - 1단계 필요',
    directModulationFromC: false,
    requiredSteps: 1,
  },
  Dm: {
    note: 'Dm',
    difficulty: 'medium',
    description: '슈퍼토닉 마이너 - 1단계 필요',
    directModulationFromC: false,
    requiredSteps: 1,
  },

  // 어려움 - 2단계 이상 전조 필요
  'C#': {
    note: 'C#',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  'F#': {
    note: 'F#',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  'G#': {
    note: 'G#',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  'A#': {
    note: 'A#',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  Bb: {
    note: 'Bb',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  Eb: {
    note: 'Eb',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  Ab: {
    note: 'Ab',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
  Db: {
    note: 'Db',
    difficulty: 'hard',
    description: '원거리 조성 - 2단계 이상',
    directModulationFromC: false,
    requiredSteps: 2,
  },
};

export function getNoteDifficulty(note: string): NoteDifficulty {
  return (
    NOTE_DIFFICULTIES[note] || {
      note,
      difficulty: 'hard',
      description: '알 수 없는 음',
      directModulationFromC: false,
      requiredSteps: 3,
    }
  );
}

export function getNotesByDifficulty(difficulty: Difficulty): string[] {
  return Object.values(NOTE_DIFFICULTIES)
    .filter(n => n.difficulty === difficulty)
    .map(n => n.note);
}

/**
 * 난이도에 따라 랜덤 음 선택
 */
export function getRandomNoteByDifficulty(difficulty: Difficulty): string {
  const notes = getNotesByDifficulty(difficulty);
  return notes[Math.floor(Math.random() * notes.length)];
}


