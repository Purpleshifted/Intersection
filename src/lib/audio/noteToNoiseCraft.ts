/**
 * assignedNote를 NoiseCraft synthesizer와 매핑하는 시스템
 * 기존 indiv_audio_map.ncft의 synthesizer와 매핑 로직을 그대로 활용
 */

import * as Tonal from 'tonal';
import type { PlayerSnapshot, GameState } from '@/types/game';

/**
 * assignedNote를 주파수로 변환
 */
export function noteToFrequency(note: string, octave: number = 4): number {
  try {
    const freq = Tonal.Note.freq(`${note}${octave}`);
    return freq || 261.63; // 폴백: C4
  } catch {
    return 261.63;
  }
}

/**
 * assignedNote를 MIDI 노트 번호로 변환
 */
export function noteToMidi(note: string, octave: number = 4): number {
  try {
    // Tonal.js로 MIDI 번호 계산
    const midi = Tonal.Note.midi(`${note}${octave}`);
    return midi || 60; // 폴백: C4 = MIDI 60
  } catch {
    return 60;
  }
}

/**
 * assignedNote를 12톤 인덱스로 변환 (0-11)
 * C=0, C#=1, D=2, ..., B=11
 */
export function noteTo12ToneIndex(note: string): number {
  try {
    // "BB" 같은 잘못된 형식 정규화 (Bb로 변환)
    let normalizedNote = note;
    if (normalizedNote === 'BB' || normalizedNote === 'bb') {
      normalizedNote = 'Bb';
    }
    
    // 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    const chroma = Tonal.Note.chroma(normalizedNote);
    return chroma !== null ? chroma : 0;
  } catch {
    // 폴백: note 이름에서 직접 추출
    const noteMap: Record<string, number> = {
      'C': 0, 'C#': 1, 'Db': 1,
      'D': 2, 'D#': 3, 'Eb': 3,
      'E': 4,
      'F': 5, 'F#': 6, 'Gb': 6,
      'G': 7, 'G#': 8, 'Ab': 8,
      'A': 9, 'A#': 10, 'Bb': 10, 'BB': 10, 'bb': 10, // BB도 처리
      'B': 11,
    };
    // 마이너 코드에서 루트 추출 (예: 'Am' -> 'A')
    let root = note.replace(/m$/, '').replace(/dim$/, '').replace(/aug$/, '');
    // "BB" 정규화
    if (root === 'BB' || root === 'bb') {
      root = 'Bb';
    }
    return noteMap[root] || 0;
  }
}

/**
 * assignedNote를 4-row sequencer 인덱스로 변환 (0-3)
 * indiv_audio_map.ncft의 MonoSeq 구조에 맞춤
 */
export function noteTo4RowIndex(note: string): number {
  const tone12 = noteTo12ToneIndex(note);
  // 12톤을 4개 행으로 매핑 (0-2, 3-5, 6-8, 9-11)
  return Math.floor(tone12 / 3);
}

/**
 * 게임 상태에서 플레이어의 assignedNote 기반 파라미터 생성
 * 기존 indiv_audio_map.ncft의 매핑 로직 활용
 */
export interface NoteBasedParams {
  // 주파수 관련
  frequency?: number;
  midiNote?: number;
  tone12Index?: number;
  row4Index?: number;
  
  // 게임 상태 기반
  distance?: number; // 가장 가까운 플레이어와의 거리
  pan?: number; // -1 (왼쪽) ~ 1 (오른쪽)
  gain?: number; // 0 ~ 1
  velocity?: number; // 속도 기반
  activity?: number; // 활동 점수
}

/**
 * 플레이어의 assignedNote와 게임 상태를 기반으로 NoiseCraft 파라미터 생성
 */
export function generateNoteBasedParams(
  player: PlayerSnapshot,
  gameState: GameState
): NoteBasedParams {
  if (!player.assignedNote) {
    return {};
  }

  const note = player.assignedNote;
  
  // 1. 음 기반 기본 파라미터
  const frequency = noteToFrequency(note, 4);
  const midiNote = noteToMidi(note, 4);
  const tone12Index = noteTo12ToneIndex(note);
  const row4Index = noteTo4RowIndex(note);

  // 2. 게임 상태 기반 파라미터
  const selfId = gameState.selfId;
  const selfPos = player.cell.position;
  
  // 가장 가까운 플레이어 찾기
  let nearestDistance = Infinity;
  let nearestPan = 0;
  
  Object.values(gameState.players).forEach((other) => {
    if (other.id === player.id) return;
    
    const dx = other.cell.position.x - selfPos.x;
    const dy = other.cell.position.y - selfPos.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist < nearestDistance) {
      nearestDistance = dist;
      // 팬 계산 (-1 ~ 1)
      const angle = Math.atan2(dy, dx);
      nearestPan = Math.sin(angle); // 좌우 팬
    }
  });

  // 속도 기반 활동 점수
  const velocity = Math.hypot(player.cell.velocity.x, player.cell.velocity.y);
  const maxVelocity = 320; // MAX_SPEED
  const activity = Math.min(1, velocity / maxVelocity);

  // 거리 정규화 (0 ~ 1, 가까울수록 높음)
  const maxDistance = 1000;
  const normalizedDistance = Math.max(0, 1 - (nearestDistance / maxDistance));

  return {
    frequency,
    midiNote,
    tone12Index,
    row4Index,
    distance: normalizedDistance,
    pan: nearestPan,
    gain: Math.min(1, 0.5 + activity * 0.5), // 기본 0.5 + 활동 기반
    velocity: activity,
    activity,
  };
}

/**
 * NoiseCraft 노드 파라미터로 변환
 * indiv_audio_map.ncft의 노드 구조에 맞춤
 */
export interface NoiseCraftNodeParam {
  nodeId: string;
  paramName: string;
  value: number;
}

/**
 * 기존 indiv_audio_map.ncft 매핑 구조에 맞춰 파라미터 생성
 * 
 * 주요 노드 (indiv_audio_map.ncft 기준):
 * - 노드 4: Const (주파수/톤 관련)
 * - 노드 5: Const (게인/볼륨)
 * - 노드 17: % knob (거리/확률)
 * - MonoSeq 노드들: 패턴 기반 화음
 */
export function mapToNoiseCraftNodes(
  params: NoteBasedParams,
  config?: {
    frequencyNodeId?: string;
    gainNodeId?: string;
    distanceNodeId?: string;
    panNodeId?: string;
    sequencerNodeIds?: string[]; // MonoSeq 노드 ID들
  }
): NoiseCraftNodeParam[] {
  const result: NoiseCraftNodeParam[] = [];
  
  const {
    frequencyNodeId = '4', // 기본: Const 노드
    gainNodeId = '5', // 기본: Const 노드
    distanceNodeId = '17', // 기본: % knob
    panNodeId, // 선택적
    sequencerNodeIds = [], // MonoSeq 노드들
  } = config || {};

  // 주파수 매핑
  // 노드 4는 Add 노드의 입력으로 사용되므로, 주파수 오프셋 값으로 사용
  // 주파수를 Hz 단위로 직접 전달하거나, 정규화된 값으로 전달
  // indiv_audio_map.ncft 구조상 노드 4는 Add의 입력이므로 오프셋 값
  // 주파수 범위를 고려하여 적절한 스케일로 변환
  if (params.frequency !== undefined) {
    // 주파수를 0-1 범위로 정규화 (100-1000Hz 범위)
    // 또는 주파수 자체를 전달 (노드 구조에 따라 다름)
    const minFreq = 100;
    const maxFreq = 1000;
    const normalizedFreq = Math.max(0, Math.min(1, (params.frequency - minFreq) / (maxFreq - minFreq)));
    result.push({
      nodeId: frequencyNodeId,
      paramName: 'value',
      value: normalizedFreq,
    });
  }

  // 게인 매핑
  if (params.gain !== undefined) {
    result.push({
      nodeId: gainNodeId,
      paramName: 'value',
      value: params.gain,
    });
  }

  // 거리 매핑
  if (params.distance !== undefined && distanceNodeId) {
    result.push({
      nodeId: distanceNodeId,
      paramName: 'value',
      value: params.distance,
    });
  }

  // 팬 매핑
  if (params.pan !== undefined && panNodeId) {
    // -1 ~ 1을 0 ~ 1로 변환
    const normalizedPan = (params.pan + 1) / 2;
    result.push({
      nodeId: panNodeId,
      paramName: 'value',
      value: normalizedPan,
    });
  }

  // Sequencer 패턴 매핑은 별도 함수로 처리 (toggleCell 메시지 필요)
  // 여기서는 일반 파라미터만 반환

  return result;
}

/**
 * assignedNote를 MonoSeq 패턴으로 변환
 * 4-row sequencer에 맞춰 패턴 생성 (각 행은 12톤을 3개씩 그룹화)
 * 
 * @param assignedNote - 부여받은 음 ('C', 'F', 'G' 등)
 * @returns 4-element array [row0, row1, row2, row3] where exactly one is 1
 */
export function noteTo4RowPattern(note: string): number[] {
  const row4Index = noteTo4RowIndex(note);
  const pattern = [0, 0, 0, 0];
  pattern[row4Index] = 1;
  return pattern;
}

/**
 * MonoSeq 노드에 패턴을 업데이트하는 파라미터 생성
 * noiseCraft:toggleCell 메시지를 직접 보내야 하므로, 여기서는 패턴 정보만 반환
 */
export interface MonoSeqPatternUpdate {
  nodeId: string;
  patternIndex: number;
  rowIndex: number;
  stepIndex: number;
  value: number;
}

/**
 * assignedNote를 기반으로 기능화성에 맞는 MonoSeq 패턴 생성
 * C Major 기준으로 assignedNote의 코드 구성음을 생성
 * 
 * @param assignedNote - 부여받은 음 ('C', 'F', 'G' 등)
 * @param sequencerNodeIds - MonoSeq 노드 ID 배열 [bass, baritone, tenor]
 * @param numSteps - 시퀀서 스텝 수 (기본 4)
 * @param patternIndex - 패턴 인덱스 (기본 0)
 * @returns 패턴 업데이트 정보 배열
 */
export function generateMonoSeqPatternUpdates(
  assignedNote: string,
  sequencerNodeIds: string[],
  numSteps: number = 4,
  patternIndex: number = 0
): MonoSeqPatternUpdate[] {
  const updates: MonoSeqPatternUpdate[] = [];
  
  // assignedNote를 기반으로 C Major에서의 코드 생성
  // 예: F → F Major (F, A, C), G → G Major (G, B, D)
  let chordNotes: string[] = [];
  
  try {
    // 마이너 코드 처리 (예: 'Am' → 'A'로 변환)
    const rootNote = assignedNote.replace(/m$/, '').replace(/dim$/, '').replace(/aug$/, '');
    const isMinor = assignedNote.endsWith('m');
    
    // Tonal.js로 코드 구성음 가져오기
    const chordName = isMinor ? `${rootNote}m` : rootNote;
    const chord = Tonal.Chord.get(chordName);
    
    if (chord && chord.notes && chord.notes.length >= 3) {
      // 트라이어드 (3음) 사용
      chordNotes = chord.notes.slice(0, 3);
    } else {
      // 폴백: 단순히 root note만 사용
      chordNotes = [rootNote];
    }
  } catch (error) {
    console.warn('[NoiseCraft] Error generating chord for', assignedNote, error);
    // 폴백: assignedNote 자체를 사용
    const rootNote = assignedNote.replace(/m$/, '');
    chordNotes = [rootNote];
  }
  
  // 각 MonoSeq 노드에 대해 패턴 업데이트 생성
  sequencerNodeIds.forEach((nodeId, voiceIndex) => {
    // bass: 첫 번째 음 (root)
    // baritone: 두 번째 음 (3rd)
    // tenor: 세 번째 음 (5th)
    let targetNote: string;
    if (voiceIndex === 0) {
      targetNote = chordNotes[0] || assignedNote;
    } else if (voiceIndex === 1) {
      targetNote = chordNotes[1] || chordNotes[0] || assignedNote;
    } else {
      targetNote = chordNotes[2] || chordNotes[0] || assignedNote;
    }
    
    // 음을 12톤 인덱스로 변환 (0-11)
    // MonoSeq는 chromatic scale을 사용하므로 12톤 인덱스를 직접 사용
    const tone12Index = noteTo12ToneIndex(targetNote);
    
    // indiv_audio_map.ncft의 MonoSeq는 13개의 스텝을 가지고 있음
    // 각 스텝은 4개의 행(row)을 가짐
    // 하지만 chromatic scale이므로 실제로는 12개의 행이 필요함
    // 패턴 구조: patterns[patternIndex][stepIndex][rowIndex]
    // stepIndex: 0-12 (13개 스텝)
    // rowIndex: 0-3 (4개 행, 각 행은 3개씩 12톤을 그룹화)
    
    // 12톤을 4-row로 변환 (각 row는 3개씩: 0-2, 3-5, 6-8, 9-11)
    const targetRow = Math.floor(tone12Index / 3);
    
    // 모든 스텝(13개)과 모든 행(4개)을 클리어
    const NUM_STEPS = 13; // indiv_audio_map.ncft의 실제 스텝 수
    const NUM_ROWS = 4; // 4개 행
    
    for (let step = 0; step < NUM_STEPS; step++) {
      for (let row = 0; row < NUM_ROWS; row++) {
        // 해당 행의 첫 번째 스텝에만 노트 배치
        const isActive = (step === 0 && row === targetRow);
        updates.push({
          nodeId,
          patternIndex,
          rowIndex: row,
          stepIndex: step,
          value: isActive ? 1 : 0,
        });
      }
    }
  });
  
  console.log('[NoiseCraft] Generated pattern for', assignedNote, {
    chordNotes,
    updates: updates.length,
  });
  
  return updates;
}

