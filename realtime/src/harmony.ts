/**
 * 서버 측 화성 진행 계산
 * Tonal.js를 활용한 기능화성 기반 전조 시스템
 */

import * as Tonal from 'tonal';

export interface HarmonicState {
  currentKey: string;
  currentMode: 'major' | 'minor';
  targetKey: string | null;
  progression: string[];
  tension: number;
  resolutionTarget: string;
  lastUpdate: number;
  activeClusters: Array<{ note: string; strength: number }>;
}

export interface NoteCluster {
  note: string;
  players: Array<{
    id: string;
    activityScore: number;
    clusterDuration: number;
  }>;
  totalActivity: number;
  averageDuration: number;
  size: number;
  strength: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

const EASY_NOTES = ['C', 'G', 'F', 'Am', 'Em'];
const MEDIUM_NOTES = ['D', 'A', 'E', 'Bm', 'Dm'];
const HARD_NOTES = ['C#', 'F#', 'G#', 'A#', 'Bb', 'Eb', 'Ab', 'Db'];

export function getRandomNoteByDifficulty(difficulty: Difficulty = 'easy'): string {
  let notes: string[];
  switch (difficulty) {
    case 'easy':
      notes = EASY_NOTES;
      break;
    case 'medium':
      notes = MEDIUM_NOTES;
      break;
    case 'hard':
      notes = HARD_NOTES;
      break;
    default:
      notes = EASY_NOTES;
  }
  return notes[Math.floor(Math.random() * notes.length)];
}

export function resolveToTonic(
  targetKey: string,
  fromKey: string
): string[] {
  if (fromKey === 'F' && targetKey === 'C') {
    return ['IV', 'V', 'I'];
  }
  if (fromKey === 'G' && targetKey === 'C') {
    return ['V', 'I'];
  }
  if (fromKey === 'D' && targetKey === 'C') {
    return ['ii', 'V', 'I'];
  }
  if (fromKey === 'A' && targetKey === 'C') {
    return ['vi', 'V', 'I'];
  }
  return ['I'];
}

export function modulateToKey(
  fromKey: string,
  toKey: string,
  mode: 'major' | 'minor'
): string[] {
  try {
    const fromNote = Tonal.Note.get(fromKey);
    const toNote = Tonal.Note.get(toKey);

    if (!fromNote || !toNote) {
      return ['I'];
    }

    const interval = Tonal.Interval.distance(fromNote, toNote);

    if (interval === '4P') {
      return mode === 'major' ? ['I', 'IV', 'I'] : ['i', 'iv', 'i'];
    }
    if (interval === '5P') {
      return mode === 'major' ? ['I', 'V', 'I'] : ['i', 'v', 'i'];
    }
    if (interval === '2M') {
      return mode === 'major'
        ? ['I', 'ii', 'V', 'I']
        : ['i', 'ii°', 'v', 'i'];
    }

    return mode === 'major' ? ['I', 'V', 'I'] : ['i', 'v', 'i'];
  } catch {
    return ['I'];
  }
}

/**
 * 경쟁 시나리오에서 텐션 코드 생성 (모든 음에 대해 일반화)
 * Tonal.js를 활용하여 두 음을 포함하는 공통 코드를 찾고,
 * 현재 조성에서의 자연스러운 화성 진행을 생성
 */
export function computeTensionChord(
  competitors: NoteCluster[],
  currentKey: string = 'C',
  mode: 'major' | 'minor' = 'major'
): { progression: string[]; chordName: string } {
  if (competitors.length < 2) {
    return { progression: ['V7'], chordName: 'G7' };
  }

  const notes = competitors.map(c => c.note);
  
  // 1. 현재 조성의 스케일 가져오기
  const scale = Tonal.Scale.get(`${currentKey} ${mode}`);
  if (!scale || !scale.notes || scale.notes.length === 0) {
    return { progression: ['V7'], chordName: 'G7' };
  }
  
  // 2. 스케일 내의 모든 코드 생성 (트라이어드)
  // Major: I, ii, iii, IV, V, vi, vii°
  // Minor: i, ii°, III, iv, v, VI, VII
  const scaleChords = scale.notes.map((root, index) => {
    if (mode === 'major') {
      // Major 스케일: I, ii, iii, IV, V, vi, vii°
      if (index === 6) {
        // vii°: diminished
        return Tonal.Chord.get(`${root}dim`);
      } else if ([1, 2, 5].includes(index)) {
        // ii, iii, vi: minor
        return Tonal.Chord.get(`${root}m`);
      } else {
        // I, IV, V: major
        return Tonal.Chord.get(root);
      }
    } else {
      // Minor 스케일: i, ii°, III, iv, v, VI, VII
      if (index === 1) {
        // ii°: diminished
        return Tonal.Chord.get(`${root}dim`);
      } else if ([0, 3, 4].includes(index)) {
        // i, iv, v: minor
        return Tonal.Chord.get(`${root}m`);
      } else {
        // III, VI, VII: major
        return Tonal.Chord.get(root);
      }
    }
  }).filter(Boolean);
  
  // 3. 두 음을 모두 포함하는 코드 찾기
  const matchingChords = scaleChords.filter(chord => {
    if (!chord || !chord.notes) return false;
    const chordPcs = chord.notes.map(n => Tonal.Note.get(n)?.pc).filter(Boolean);
    return notes.every(note => {
      const notePc = Tonal.Note.get(note)?.pc;
      return notePc !== null && chordPcs.includes(notePc);
    });
  });
  
  if (matchingChords.length > 0) {
    // 공통 음이 가장 많은 코드 선택 (우선순위)
    const chord = matchingChords.reduce((best, current) => {
      if (!best || !current) return best || current;
      const bestCommon = best.notes?.filter(n => 
        notes.some(note => Tonal.Note.get(n)?.pc === Tonal.Note.get(note)?.pc)
      ).length || 0;
      const currentCommon = current.notes?.filter(n => 
        notes.some(note => Tonal.Note.get(n)?.pc === Tonal.Note.get(note)?.pc)
      ).length || 0;
      return currentCommon > bestCommon ? current : best;
    });
    
    if (chord && chord.tonic) {
      // 4. 코드를 현재 조성에서의 로마 숫자로 변환
      const chordRoot = chord.tonic;
      const scaleIndex = scale.notes.findIndex(
        n => Tonal.Note.get(n)?.pc === Tonal.Note.get(chordRoot)?.pc
      );
      
      if (scaleIndex >= 0) {
        const romanNumerals = mode === 'major'
          ? ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
          : ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'];
        const romanNumeral = romanNumerals[scaleIndex];
        
        // 5. 텐션 코드 생성: 해당 코드로 가는 자연스러운 진행
        // 기능화성적 관계에 따른 진행:
        // - I → V7 (도미넌트)
        // - IV → ii-V (서브도미넌트 → 도미넌트)
        // - V → I (해결)
        // - ii → V-I (도미넌트 준비)
        // - vi → IV-V-I (서브도미넌트 → 도미넌트 → 토닉)
        // - iii → vi-IV-V-I (중간 단계)
        
        if (scaleIndex === 0) {
          // I → V7
          const v7Chord = scaleChords[4]; // V
          return {
            progression: ['V7'],
            chordName: v7Chord?.name || 'G7',
          };
        } else if (scaleIndex === 3) {
          // IV → ii-V
          const iiChord = scaleChords[1]; // ii
          const vChord = scaleChords[4]; // V
          return {
            progression: ['ii', 'V'],
            chordName: iiChord?.name || 'Dm7',
          };
        } else if (scaleIndex === 4) {
          // V → I
          return {
            progression: ['I'],
            chordName: scaleChords[0]?.name || 'C',
          };
        } else if (scaleIndex === 1) {
          // ii → V-I
          const vChord = scaleChords[4]; // V
          return {
            progression: ['V', 'I'],
            chordName: vChord?.name || 'G7',
          };
        } else if (scaleIndex === 5) {
          // vi → IV-V-I
          return {
            progression: ['IV', 'V', 'I'],
            chordName: scaleChords[5]?.name || 'Am',
          };
        } else if (scaleIndex === 2) {
          // iii → vi-IV-V-I
          return {
            progression: ['vi', 'IV', 'V', 'I'],
            chordName: scaleChords[2]?.name || 'Em',
          };
        } else {
          // 기타 → ii-V-I
          return {
            progression: ['ii', 'V', 'I'],
            chordName: scaleChords[1]?.name || 'Dm7',
          };
        }
      }
    }
  }
  
  // 기본값: 도미넌트 7th (현재 조성의 V7)
  const v7Chord = scaleChords[4]; // V
  return {
    progression: ['V7'],
    chordName: v7Chord?.name || 'G7',
  };
}

export function computeNoteClusters(
  players: Array<{
    id: string;
    assignedNote: string;
    activityScore: number;
    clusterDuration: number;
  }>
): NoteCluster[] {
  const byNote = new Map<string, typeof players>();

  players.forEach(p => {
    if (!byNote.has(p.assignedNote)) {
      byNote.set(p.assignedNote, []);
    }
    byNote.get(p.assignedNote)!.push(p);
  });

  return Array.from(byNote.entries()).map(([note, members]) => {
    const totalActivity = members.reduce(
      (sum, p) => sum + p.activityScore,
      0
    );
    const avgDuration =
      members.reduce((sum, p) => sum + p.clusterDuration, 0) /
      members.length;
    const size = members.length;

    const activityNorm = totalActivity / Math.max(members.length, 1);
    const durationNorm = Math.min(1, avgDuration / 10000);
    const sizeNorm = Math.min(1, size / 10);

    const strength = Math.min(
      1,
      activityNorm * 0.4 + durationNorm * 0.3 + sizeNorm * 0.3
    );

    return {
      note,
      players: members,
      totalActivity,
      averageDuration: avgDuration,
      size,
      strength,
    };
  });
}

// C Major 조성 내 자연스러운 화성 진행 패턴들
const C_MAJOR_PROGRESSIONS = [
  ['I', 'IV', 'V', 'I'],        // I - IV - V - I (가장 기본)
  ['I', 'vi', 'IV', 'V', 'I'],  // I - vi - IV - V - I (6-4-5-1)
  ['I', 'ii', 'V', 'I'],        // I - ii - V - I (2-5-1)
  ['I', 'iii', 'vi', 'IV', 'V', 'I'], // I - iii - vi - IV - V - I
  ['I', 'IV', 'I', 'V', 'I'],   // I - IV - I - V - I
];

// 진행 패턴 순환을 위한 상태
let progressionCycleIndex = 0;
let progressionStepIndex = 0;
let lastProgressionUpdate = Date.now();
const PROGRESSION_STEP_DURATION = 2000; // 각 코드 2초씩

export function computeHarmonicProgression(
  noteClusters: NoteCluster[],
  currentHarmony: HarmonicState
): HarmonicState {
  const activeClusters = noteClusters.filter(c => c.strength > 0.3);

  if (activeClusters.length === 0) {
    // 활성 클러스터 없음 → C Major 조성 내 자연스러운 화성 진행 반복
    const now = Date.now();
    
    // C Major가 아니면 먼저 C Major로 resolution
    if (currentHarmony.currentKey !== 'C') {
      return {
        ...currentHarmony,
        currentKey: 'C',
        currentMode: 'major',
        targetKey: 'C',
        progression: resolveToTonic('C', currentHarmony.currentKey),
        tension: 0,
        lastUpdate: now,
        activeClusters: [],
      };
    }
    
    // 초기 상태(플레이어 없음)에서는 항상 C Major I만 반환
    // 플레이어가 나타나면 자연스러운 화성 진행 시작
    if (currentHarmony.progression.length === 1 && currentHarmony.progression[0] === 'I') {
      // 이미 C Major I 상태면 유지
      return {
        ...currentHarmony,
        currentKey: 'C',
        currentMode: 'major',
        targetKey: 'C',
        progression: ['I'], // 초기 상태: 항상 I만
        tension: 0,
        lastUpdate: now,
        activeClusters: [],
      };
    }
    
    // C Major 조성 내에서 진행 패턴 순환 (플레이어가 있었지만 모두 떠난 경우)
    const currentProgression = C_MAJOR_PROGRESSIONS[progressionCycleIndex % C_MAJOR_PROGRESSIONS.length];
    
    // 시간에 따라 진행 단계 이동
    if (now - lastProgressionUpdate >= PROGRESSION_STEP_DURATION) {
      progressionStepIndex = (progressionStepIndex + 1) % currentProgression.length;
      lastProgressionUpdate = now;
      
      // 한 사이클 완료 시 다음 진행 패턴으로
      if (progressionStepIndex === 0) {
        progressionCycleIndex = (progressionCycleIndex + 1) % C_MAJOR_PROGRESSIONS.length;
      }
    }
    
    // 전체 진행 패턴 반환 (시퀀서의 여러 스텝에 배치하기 위해)
    // 현재 단계를 시작점으로 하는 진행 반환
    const rotatedProgression = [
      ...currentProgression.slice(progressionStepIndex),
      ...currentProgression.slice(0, progressionStepIndex),
    ];
    
    return {
      ...currentHarmony,
      currentKey: 'C',
      currentMode: 'major',
      targetKey: 'C',
      progression: rotatedProgression, // 전체 진행 패턴
      tension: 0,
      lastUpdate: now,
      activeClusters: [],
    };
  }

  const strongest = activeClusters.reduce((max, c) =>
    c.strength > max.strength ? c : max
  );

  const competitors = activeClusters.filter(
    c => c.strength > strongest.strength * 0.7 && c.note !== strongest.note
  );

  if (competitors.length > 0) {
    const tension = computeTensionChord(
      [strongest, ...competitors],
      currentHarmony.currentKey,
      currentHarmony.currentMode
    );
    return {
      ...currentHarmony,
      targetKey: null,
      progression: tension.progression,
      tension: 0.7,
      lastUpdate: Date.now(),
    };
  }

  const targetKey = strongest.note;
  const targetMode = 'major';

  // 활성 클러스터가 있으면 진행 패턴 인덱스 리셋
  progressionCycleIndex = 0;
  progressionStepIndex = 0;
  lastProgressionUpdate = Date.now();

  return {
    ...currentHarmony,
    currentKey: targetKey,
    currentMode: targetMode,
    targetKey,
    progression:
      currentHarmony.currentKey === targetKey
        ? ['I']
        : modulateToKey(currentHarmony.currentKey, targetKey, targetMode),
    tension: 0,
    lastUpdate: Date.now(),
    activeClusters: activeClusters.map(c => ({
      note: c.note,
      strength: c.strength,
    })),
  };
}

export function createInitialHarmony(): HarmonicState {
  return {
    currentKey: 'C',
    currentMode: 'major',
    targetKey: null,
    progression: ['I'],
    tension: 0,
    resolutionTarget: 'C',
    lastUpdate: Date.now(),
    activeClusters: [],
  };
}

