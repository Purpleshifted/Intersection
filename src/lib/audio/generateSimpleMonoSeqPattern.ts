/**
 * individual_audio_test.ncft용 MonoSeq 패턴 생성
 * 12톤(1 octave)만 사용하는 단순한 패턴
 */

import * as Tonal from 'tonal';
import { noteTo12ToneIndex } from './noteToNoiseCraft';

export interface SimpleMonoSeqPatternUpdate {
  nodeId: string;
  patternIndex: number;
  stepIndex: number;
  rowIndex: number; // 0-12 (13개 행, chromatic 1 octave)
  value: number;
}

/**
 * assignedNote를 기반으로 12톤 MonoSeq 패턴 생성
 * individual_audio_test.ncft는 12개 스텝, 13개 행을 사용 (chromatic, 1 octave = 13 rows)
 * 
 * @param assignedNote - 부여받은 음 ('C', 'F', 'G' 등)
 * @param sequencerNodeIds - MonoSeq 노드 ID 배열 (글로벌 뷰: [211, 212, 213])
 * @param numSteps - 시퀀서 스텝 수 (기본 12)
 * @param patternIndex - 패턴 인덱스 (기본 0)
 * @param neighborNotes - 이웃 유저들의 assignedNote 배열 (화음 구성용, 선택적)
 * @returns 패턴 업데이트 정보 배열
 */
export function generateSimpleMonoSeqPatternUpdates(
  assignedNote: string,
  sequencerNodeIds: string[],
  numSteps: number = 12,
  patternIndex: number = 0,
  neighborNotes: string[] = []
): SimpleMonoSeqPatternUpdate[] {
  const updates: SimpleMonoSeqPatternUpdate[] = [];
  
  // assignedNote를 기반으로 코드 구성음 생성
  let chordNotes: string[] = [];
  
  try {
    // "BB" 같은 잘못된 형식 정규화 (Bb로 변환)
    let normalizedNote = assignedNote;
    if (normalizedNote === 'BB' || normalizedNote === 'bb') {
      normalizedNote = 'Bb';
    }
    
    const rootNote = normalizedNote.replace(/m$/, '').replace(/dim$/, '').replace(/aug$/, '');
    const isMinor = normalizedNote.endsWith('m');
    
    const chordName = isMinor ? `${rootNote}m` : rootNote;
    const chord = Tonal.Chord.get(chordName);
    
    if (chord && chord.notes && chord.notes.length >= 3) {
      chordNotes = chord.notes.slice(0, 3);
    } else {
      chordNotes = [rootNote];
    }
  } catch (error) {
    console.warn('[NoiseCraft] Error generating chord for', assignedNote, error);
    // "BB" 정규화
    let rootNote = assignedNote.replace(/m$/, '');
    if (rootNote === 'BB' || rootNote === 'bb') {
      rootNote = 'Bb';
    }
    chordNotes = [rootNote];
  }
  
  // 이웃 유저들의 assignedNote를 사용하여 화음 구성
  // 혼자일 때: 자신의 assignedNote만 사용 (bass만 활성화)
  // 다른 유저와 만났을 때: 자신 + 이웃 유저들의 assignedNote로 화음 구성
  const allNotes = [assignedNote, ...neighborNotes].filter(Boolean);
  
  // 각 MonoSeq 노드에 대해 패턴 업데이트 생성
  sequencerNodeIds.forEach((nodeId, voiceIndex) => {
    // bass: 첫 번째 음 (자신의 assignedNote)
    // baritone: 두 번째 음 (첫 번째 이웃 유저의 assignedNote, 없으면 비활성화)
    // tenor: 세 번째 음 (두 번째 이웃 유저의 assignedNote, 없으면 비활성화)
    let targetNote: string | null = null;
    if (voiceIndex === 0) {
      // bass: 항상 자신의 assignedNote
      targetNote = assignedNote;
    } else if (voiceIndex === 1 && neighborNotes.length > 0) {
      // baritone: 첫 번째 이웃 유저의 assignedNote
      targetNote = neighborNotes[0];
    } else if (voiceIndex === 2 && neighborNotes.length > 1) {
      // tenor: 두 번째 이웃 유저의 assignedNote
      targetNote = neighborNotes[1];
    }
    
    // targetNote가 null이면 해당 voice는 비활성화 (모든 셀을 0으로 설정)
    
    // individual_audio_test.ncft는 12개 스텝, 13개 행을 사용
    // MonoSeq의 genScale('C2', 'chromatic', 1)은 13개 노트를 생성:
    // Row 0: C2 (chroma 0), Row 1: C#2 (chroma 1), ..., Row 11: B2 (chroma 11), Row 12: C3 (chroma 0, 다음 옥타브)
    // 패턴 구조: patterns[patternIndex][stepIndex][rowIndex]
    // stepIndex: 0-11 (12개 스텝)
    // rowIndex: 0-12 (13개 행, 마지막 행은 다음 옥타브의 root)
    
    const NUM_ROWS = 13; // chromatic scale, 1 octave = 13 rows (includes next octave root)
    
    if (targetNote === null) {
      // targetNote가 null이면 해당 voice는 비활성화 (모든 셀을 0으로 설정)
      for (let step = 0; step < numSteps; step++) {
        for (let row = 0; row < NUM_ROWS; row++) {
          updates.push({
            nodeId,
            patternIndex,
            rowIndex: row,
            stepIndex: step,
            value: 0,
          });
        }
      }
    } else {
      // 음을 12톤 인덱스로 변환 (0-11)
      const tone12Index = noteTo12ToneIndex(targetNote);
      
      // 모든 스텝(12개)과 모든 행(13개)을 클리어한 후, 해당 음의 행에 첫 번째 스텝에만 노트 배치
      for (let step = 0; step < numSteps; step++) {
        for (let row = 0; row < NUM_ROWS; row++) {
          // tone12Index는 0-11이므로, rowIndex와 직접 매칭
          // Row 12는 C3이므로 tone12Index 0과 동일 (다음 옥타브의 C)
          // 하지만 일반적으로는 Row 0-11만 사용 (Row 12는 옥타브 경계)
          const isActive = (step === 0 && row === tone12Index);
          updates.push({
            nodeId,
            patternIndex,
            rowIndex: row,
            stepIndex: step,
            value: isActive ? 1 : 0,
          });
        }
      }
    }
  });
  
  console.log('[NoiseCraft] Generated simple pattern for', assignedNote, {
    chordNotes,
    tone12Indices: sequencerNodeIds.map((nodeId, idx) => {
      const targetNote = idx === 0 
        ? (chordNotes[0] || assignedNote)
        : idx === 1
        ? (chordNotes[1] || chordNotes[0] || assignedNote)
        : (chordNotes[2] || chordNotes[0] || assignedNote);
      return {
        nodeId,
        note: targetNote,
        tone12Index: noteTo12ToneIndex(targetNote),
      };
    }),
    updates: updates.length,
    sequencerNodeIds,
  });
  
  return updates;
}

