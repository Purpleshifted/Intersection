/**
 * 화성 호환성 계산 유틸리티
 * 두 음이 화성적으로 좋은 조합인지 판단
 */

import * as Tonal from 'tonal';

/**
 * 두 음이 화성적으로 좋은 조합인지 판단
 * @param note1 첫 번째 음 (예: 'C', 'F', 'G')
 * @param note2 두 번째 음 (예: 'C', 'F', 'G')
 * @param currentKey 현재 조성 (기본값: 'C')
 * @param mode 현재 모드 (기본값: 'major')
 * @returns 호환성 점수 (0-1, 1에 가까울수록 좋은 조합)
 */
export function computeHarmonicCompatibility(
  note1: string | undefined | null,
  note2: string | undefined | null,
  currentKey: string = 'C',
  mode: 'major' | 'minor' = 'major'
): number {
  // 둘 중 하나라도 음이 없으면 호환성 없음
  if (!note1 || !note2) return 0;

  // 같은 음이면 높은 호환성
  if (note1 === note2) return 0.9;

  // 현재 조성의 스케일 가져오기
  const scale = Tonal.Scale.get(`${currentKey} ${mode}`);
  if (!scale || !scale.notes || scale.notes.length === 0) {
    return 0.5; // 기본값
  }

  // 스케일 내의 모든 코드 생성
  const scaleChords = scale.notes.map((root, index) => {
    if (mode === 'major') {
      if (index === 6) return Tonal.Chord.get(`${root}dim`);
      else if ([1, 2, 5].includes(index)) return Tonal.Chord.get(`${root}m`);
      else return Tonal.Chord.get(root);
    } else {
      if (index === 1) return Tonal.Chord.get(`${root}dim`);
      else if ([0, 3, 4].includes(index)) return Tonal.Chord.get(`${root}m`);
      else return Tonal.Chord.get(root);
    }
  }).filter(Boolean);

  // 두 음을 모두 포함하는 코드 찾기
  const matchingChords = scaleChords.filter(chord => {
    if (!chord || !chord.notes) return false;
    const chordPcs = chord.notes.map(n => Tonal.Note.get(n)?.pc).filter(Boolean);
    const note1Pc = Tonal.Note.get(note1)?.pc;
    const note2Pc = Tonal.Note.get(note2)?.pc;
    return note1Pc && note2Pc && 
           chordPcs.includes(note1Pc) && 
           chordPcs.includes(note2Pc);
  });

  if (matchingChords.length > 0) {
    // 공통 코드를 가지면 높은 호환성
    // 코드의 스케일 내 위치에 따라 점수 조정
    const chord = matchingChords[0];
    if (!chord || !chord.tonic) return 0.7;

    const chordRoot = chord.tonic;
    const scaleIndex = scale.notes.findIndex(
      n => Tonal.Note.get(n)?.pc === Tonal.Note.get(chordRoot)?.pc
    );

    // 주요 코드 (I, IV, V)는 더 높은 점수
    if (scaleIndex === 0) return 0.95; // I
    if (scaleIndex === 3) return 0.9;  // IV
    if (scaleIndex === 4) return 0.9;  // V
    if (scaleIndex === 1) return 0.8;  // ii
    if (scaleIndex === 5) return 0.8;  // vi
    if (scaleIndex === 2) return 0.75; // iii

    return 0.7; // 기타 코드
  }

  // 공통 코드가 없어도 음정 거리가 가까우면 중간 호환성
  const note1Pc = Tonal.Note.get(note1)?.pc;
  const note2Pc = Tonal.Note.get(note2)?.pc;
  if (note1Pc && note2Pc) {
    const interval = Tonal.Interval.distance(note1, note2);
    // 완전 4도, 완전 5도는 좋은 조합
    if (interval === '4P' || interval === '5P') return 0.6;
    // 장 3도, 단 3도도 괜찮은 조합
    if (interval === '3M' || interval === '3m') return 0.5;
  }

  // 기본값: 낮은 호환성
  return 0.3;
}

