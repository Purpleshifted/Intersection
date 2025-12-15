/**
 * 글로벌 뷰용 화성 진행 시퀀서 패턴 생성
 * C 메이저 화성 진행을 MonoSeq 패턴으로 변환
 */

import type { HarmonicState } from "@/types/game";
import * as Tonal from 'tonal';

/**
 * 로마 숫자 코드를 실제 음표 배열로 변환
 * @param romanNumeral - 로마 숫자 ('I', 'IV', 'V' 등)
 * @param key - 조성 ('C', 'F' 등)
 * @param mode - 모드 ('major' | 'minor')
 * @returns 코드 구성음 배열 (예: ['C', 'E', 'G'])
 */
function romanNumeralToNotes(
  romanNumeral: string,
  key: string,
  mode: 'major' | 'minor'
): string[] {
  try {
    // key와 mode가 없으면 기본값 사용
    const validKey = key || 'C';
    const validMode = mode || 'major';
    
    // Tonal.js를 사용하여 로마 숫자를 코드로 변환
    const scale = validMode === 'major' 
      ? Tonal.Scale.get(`${validKey} major`).notes
      : Tonal.Scale.get(`${validKey} minor`).notes;
    
    if (!scale || scale.length === 0) {
      // 조용히 기본 패턴 반환 (에러 로그 제거)
      return [];
    }

    // 로마 숫자를 인덱스로 변환
    const romanToIndex: Record<string, number> = {
      'I': 0, 'i': 0,
      'II': 1, 'ii': 1,
      'III': 2, 'iii': 2,
      'IV': 3, 'iv': 3,
      'V': 4, 'v': 4,
      'VI': 5, 'vi': 5,
      'VII': 6, 'vii': 6,
    };

    const rootIndex = romanToIndex[romanNumeral];
    if (rootIndex === undefined) {
      // 조용히 기본 패턴 반환 (에러 로그 제거)
      return [];
    }

    const rootNote = scale[rootIndex % scale.length];
    
    // 메이저/마이너 구분
    const isMinor = romanNumeral === romanNumeral.toLowerCase() || mode === 'minor';
    const chordType = isMinor ? 'm' : '';
    
    // 코드 구성음 생성
    const chord = Tonal.Chord.get(`${rootNote}${chordType}`);
    if (!chord || !chord.notes || chord.notes.length === 0) {
      // 조용히 기본 패턴 반환 (에러 로그 제거)
      return [];
    }

    // 트라이어드만 반환 (3음)
    return chord.notes.slice(0, 3);
  } catch (error) {
    // 조용히 기본 패턴 반환 (에러 로그 제거)
    return [];
  }
}

/**
 * 음표를 12톤 인덱스로 변환 (C=0, C#=1, D=2, ..., B=11)
 * @param note - 음표 ('C', 'E', 'G' 등)
 * @returns 12톤 인덱스 (0-11)
 */
function noteTo12ToneIndex(note: string): number {
  try {
    // "BB" 같은 잘못된 형식 정규화
    let normalizedNote = note;
    if (normalizedNote === 'BB' || normalizedNote === 'bb') {
      normalizedNote = 'Bb';
    }
    
    const chroma = Tonal.Note.chroma(normalizedNote);
    if (chroma === null || chroma === undefined) {
      return 0;
    }
    return chroma;
  } catch (error) {
    return 0;
  }
}

/**
 * 화성 진행을 MonoSeq 패턴으로 변환
 * @param harmony - 화성 상태
 * @returns 각 MonoSeq 노드(211, 212, 213)에 대한 패턴 업데이트 정보
 */
export function generateGlobalHarmonySequencerPattern(
  harmony: HarmonicState | null
): Array<{
  nodeId: string;
  noteIndex: number; // 12톤 인덱스 (0-11), chromatic scale의 row에 직접 매핑
  stepIndex: number; // 스텝 인덱스 (0-7, 총 8 스텝)
}> {
  if (!harmony || !harmony.progression || harmony.progression.length === 0) {
    // 기본: C Major (I)
    return generateDefaultPattern();
  }

  // key와 mode가 없으면 기본값 사용
  const key = harmony.key || 'C';
  const mode = harmony.mode || 'major';

  const updates: Array<{
    nodeId: string;
    noteIndex: number;
    stepIndex: number;
  }> = [];

  // 현재 진행의 첫 번째 코드 사용 (가장 최근 코드)
  const currentChord = harmony.progression[0];
  const notes = romanNumeralToNotes(currentChord, key, mode);

  if (notes.length === 0) {
    return generateDefaultPattern();
  }

  // MonoSeq 노드 ID: 211 (bass), 212 (baritone), 213 (tenor)
  // 구조: 8 스텝, 각 스텝당 13개 row (chromatic scale: 12톤 + 1)
  const sequencerNodeIds = ['211', '212', '213'];

  // 각 voice에 코드 구성음 배치
  // bass: root (1st note)
  // baritone: 3rd (2nd note, if available)
  // tenor: 5th (3rd note, if available)
  sequencerNodeIds.forEach((nodeId, voiceIndex) => {
    const noteIndex = voiceIndex < notes.length 
      ? noteTo12ToneIndex(notes[voiceIndex])
      : null;

    if (noteIndex !== null) {
      // 각 voice는 첫 번째 스텝에 배치 (0번 스텝)
      // 화성 진행이 바뀔 때마다 업데이트됨
      updates.push({
        nodeId,
        noteIndex,
        stepIndex: 0,
      });
    }
  });

  return updates.length > 0 ? updates : generateDefaultPattern();
}

/**
 * 기본 패턴 (C Major I)
 */
function generateDefaultPattern(): Array<{
  nodeId: string;
  noteIndex: number;
  stepIndex: number;
}> {
  // C Major: C(0), E(4), G(7)
  return [
    { nodeId: '211', noteIndex: 0, stepIndex: 0 }, // C (bass)
    { nodeId: '212', noteIndex: 4, stepIndex: 0 }, // E (baritone)
    { nodeId: '213', noteIndex: 7, stepIndex: 0 }, // G (tenor)
  ];
}

