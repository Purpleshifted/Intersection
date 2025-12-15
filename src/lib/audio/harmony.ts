/**
 * 화성 기반 오디오 생성 유틸리티
 * Tonal.js를 활용한 코드 생성 및 브릿지 확인
 */

import * as Tonal from 'tonal';
import { computeModulationPath } from './modulation';
import type { HarmonicState } from '@/types/game';

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

export interface BridgeCluster {
  note: string;
  players: Array<{
    id: string;
    activityScore: number;
    clusterDuration: number;
  }>;
  strength: number;
  isActive: boolean;
  helpsNotes: string[];
}

/**
 * 화성 상태에서 코드 생성
 */
export function generateChordFromHarmony(
  harmony: HarmonicState,
  inversion: number = 0
): Array<{ freq: number; gain: number }> {
  const key = `${harmony.key}${harmony.mode === 'major' ? '' : 'm'}`;
  const chord = Tonal.Chord.get(key);
  
  if (!chord.notes || chord.notes.length === 0) {
    // 기본 C Major 코드
    return [
      { freq: 261.63, gain: 0.5 }, // C4
      { freq: 329.63, gain: 0.4 }, // E4
      { freq: 392.00, gain: 0.3 }, // G4
    ];
  }

  const notes = chord.notes;
  const baseFreq = 261.63; // C4 기준
  
  return notes.map((note, index) => {
    const freq = Tonal.Note.freq(note + '4') || baseFreq * (index + 1);
    const gain = 0.5 / (index + 1); // 첫 음이 가장 크게
    return { freq, gain };
  });
}

/**
 * 중간 단계 클러스터가 활성화되어 있는지 확인
 * 활성화되어 있으면 어려운 음도 도달 가능
 */
export function checkBridgeAvailability(
  targetNote: string,
  currentKey: string,
  activeClusters: NoteCluster[]
): {
  canReach: boolean;
  requiredBridges: string[];
  availableBridges: BridgeCluster[];
} {
  const path = computeModulationPath(targetNote, currentKey);
  
  if (path.difficulty === 'easy') {
    return {
      canReach: true,
      requiredBridges: [],
      availableBridges: [],
    };
  }
  
  // 필요한 중간 단계 음들
  const requiredBridges = path.requiredBridges;
  
  // 활성화된 클러스터 중 필요한 브릿지가 있는가?
  const availableBridges = activeClusters
    .filter(c => requiredBridges.includes(c.note) && c.strength > 0.3)
    .map(c => ({
      note: c.note,
      players: c.players,
      strength: c.strength,
      isActive: true,
      helpsNotes: [targetNote], // 이 브릿지가 도와줄 수 있는 음
    }));
  
  const canReach = availableBridges.length > 0 || path.difficulty === 'medium';
  
  return {
    canReach,
    requiredBridges,
    availableBridges,
  };
}

