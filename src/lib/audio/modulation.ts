/**
 * 기능화성적 전조 경로 계산
 * 자연스러운 전조를 위한 중간 단계(브릿지) 찾기
 */

import * as Tonal from 'tonal';

export interface ModulationPath {
  from: string;
  to: string;
  steps: string[]; // 중간 단계 음들
  difficulty: 'easy' | 'medium' | 'hard';
  requiredBridges: string[]; // 필수 중간 단계 음들
}

/**
 * C Major에서 목표 음까지의 기능화성적 전조 경로 계산
 */
export function computeModulationPath(
  targetNote: string,
  fromKey: string = 'C'
): ModulationPath {
  // 1단계: 직접 전조 가능한가?
  if (isDirectModulationPossible(fromKey, targetNote)) {
    return {
      from: fromKey,
      to: targetNote,
      steps: [targetNote],
      difficulty: 'easy',
      requiredBridges: [],
    };
  }

  // 2단계: 1단계 중간 음 찾기
  const oneStepBridge = findOneStepBridge(fromKey, targetNote);
  if (oneStepBridge) {
    return {
      from: fromKey,
      to: targetNote,
      steps: [oneStepBridge, targetNote],
      difficulty: 'medium',
      requiredBridges: [oneStepBridge],
    };
  }

  // 3단계: 2단계 이상 중간 음 찾기
  const multiStepPath = findMultiStepPath(fromKey, targetNote);
  return {
    from: fromKey,
    to: targetNote,
    steps: multiStepPath,
    difficulty: 'hard',
    requiredBridges: multiStepPath.slice(0, -1), // 마지막 제외
  };
}

/**
 * 직접 전조 가능 여부 확인
 * Circle of Fifths 기반
 */
function isDirectModulationPossible(from: string, to: string): boolean {
  const circleOfFifths = [
    'C',
    'G',
    'D',
    'A',
    'E',
    'B',
    'F#',
    'C#',
    'G#',
    'D#',
    'A#',
    'F',
  ];
  const fromIdx = circleOfFifths.indexOf(from);
  const toIdx = circleOfFifths.indexOf(to);

  if (fromIdx === -1 || toIdx === -1) return false;

  // 1단계 이내 (상행/하행 5도)
  const diff = Math.abs(toIdx - fromIdx);
  return diff <= 1 || diff === circleOfFifths.length - 1;
}

/**
 * 1단계 중간 음 찾기
 * 공통 코드를 가진 중간 음 찾기
 */
function findOneStepBridge(from: string, to: string): string | null {
  // 공통 코드를 가진 중간 음 매핑
  const commonBridges: Record<string, string[]> = {
    C: ['G', 'F', 'Am', 'Em'], // C에서 직접 갈 수 있는 곳
    G: ['D', 'C', 'Em', 'Bm'],
    F: ['Bb', 'C', 'Dm', 'Am'],
    D: ['A', 'G', 'Bm', 'F#m'],
    A: ['E', 'D', 'F#m', 'C#m'],
    E: ['B', 'A', 'C#m', 'G#m'],
    B: ['F#', 'E', 'G#m', 'D#m'],
    'F#': ['C#', 'B', 'D#m', 'A#m'],
    'C#': ['G#', 'F#', 'A#m', 'E#m'],
    'G#': ['D#', 'C#', 'E#m', 'B#m'],
    'D#': ['A#', 'G#', 'B#m', 'F#m'],
    'A#': ['F', 'D#', 'F#m', 'C#m'],
    Am: ['Em', 'C', 'F', 'Dm'],
    Em: ['Bm', 'G', 'C', 'Am'],
    Dm: ['Am', 'F', 'Bb', 'Gm'],
    Bm: ['F#m', 'D', 'G', 'Em'],
  };

  const fromBridges = commonBridges[from] || [];
  const toBridges = commonBridges[to] || [];

  // 교집합 찾기
  const intersection = fromBridges.filter(b => toBridges.includes(b));
  return intersection.length > 0 ? intersection[0] : null;
}

/**
 * 다단계 경로 찾기
 * BFS 기반 경로 탐색
 */
function findMultiStepPath(from: string, to: string): string[] {
  const circleOfFifths = [
    'C',
    'G',
    'D',
    'A',
    'E',
    'B',
    'F#',
    'C#',
    'G#',
    'D#',
    'A#',
    'F',
  ];

  // 간단한 BFS
  const queue: { note: string; path: string[] }[] = [
    { note: from, path: [from] },
  ];
  const visited = new Set<string>([from]);
  const maxDepth = 3; // 최대 3단계

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.note === to) {
      return current.path;
    }

    if (current.path.length >= maxDepth) continue;

    // 다음 가능한 음들
    const nextNotes = getPossibleNextNotes(current.note, circleOfFifths);

    for (const next of nextNotes) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push({ note: next, path: [...current.path, next] });
    }
  }

  // 경로를 찾지 못한 경우 기본 경로
  return [from, to];
}

function getPossibleNextNotes(
  note: string,
  circleOfFifths: string[]
): string[] {
  const idx = circleOfFifths.indexOf(note);
  if (idx === -1) return [];

  const next: string[] = [];
  // 상행 5도
  next.push(circleOfFifths[(idx + 1) % circleOfFifths.length]);
  // 하행 5도
  next.push(
    circleOfFifths[
      (idx - 1 + circleOfFifths.length) % circleOfFifths.length
    ]
  );

  // 상대적 마이너
  const relativeMinor = getRelativeMinor(note);
  if (relativeMinor) next.push(relativeMinor);

  return next;
}

function getRelativeMinor(note: string): string | null {
  const majorToMinor: Record<string, string> = {
    C: 'Am',
    G: 'Em',
    D: 'Bm',
    A: 'F#m',
    E: 'C#m',
    B: 'G#m',
    'F#': 'D#m',
    'C#': 'A#m',
    'G#': 'E#m',
    'D#': 'B#m',
    'A#': 'F#m',
    F: 'Dm',
  };
  return majorToMinor[note] || null;
}


